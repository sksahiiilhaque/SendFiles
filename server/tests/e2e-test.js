import assert from 'node:assert';
import crypto from 'node:crypto';
import http from 'node:http';
import { createApp } from '../src/app.js';
import { getDatabase } from '../src/config/database.js';
import { cleanupService } from '../src/services/cleanupService.js';

async function runE2eTests() {
  console.log('🧪 Starting SendFiles Comprehensive E2E Test Suite...\n');

  // Initialize DB
  getDatabase();

  const app = createApp();
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`✓ Test server running at ${baseUrl}`);

  try {
    // 1. Health check
    console.log('1. Testing /api/health ...');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.status, 'healthy');
    console.log('   ✓ Health check passed');

    // 2. Create Transfer with 2 test files
    console.log('2. Testing Transfer Creation ...');
    const file1Data = crypto.randomBytes(1024 * 50); // 50 KB
    const file2Data = crypto.randomBytes(1024 * 1024 * 2); // 2 MB
    const file1Hash = crypto.createHash('sha256').update(file1Data).digest('hex');
    const file2Hash = crypto.createHash('sha256').update(file2Data).digest('hex');

    const createPayload = {
      files: [
        { name: 'document.pdf', size: file1Data.length, type: 'application/pdf' },
        { name: 'archive.tar', size: file2Data.length, type: 'application/x-tar' }
      ],
      expiryHours: 24
    };

    const createRes = await fetch(`${baseUrl}/api/transfers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createPayload)
    });

    assert.strictEqual(createRes.status, 201);
    const transferSession = await createRes.json();
    assert(transferSession.transferId, 'Should have transferId');
    assert(transferSession.code, 'Should have 6-digit code');
    assert(transferSession.senderToken, 'Should have senderToken');
    assert.strictEqual(transferSession.files.length, 2);
    console.log(`   ✓ Transfer created! Code: ${transferSession.code}, ID: ${transferSession.transferId}`);

    // 3. Upload parts for each file
    console.log('3. Testing Multipart Upload & Part URLs ...');
    for (let fIdx = 0; fIdx < transferSession.files.length; fIdx++) {
      const fInfo = transferSession.files[fIdx];
      const testBuffer = fIdx === 0 ? file1Data : file2Data;
      const completedParts = [];

      for (let pNum = 1; pNum <= fInfo.totalParts; pNum++) {
        // Request part URL
        const partUrlRes = await fetch(
          `${baseUrl}/api/transfers/${transferSession.transferId}/files/${fInfo.id}/part-url?partNumber=${pNum}`,
          {
            headers: { 'x-sender-token': transferSession.senderToken }
          }
        );
        assert.strictEqual(partUrlRes.status, 200);
        const { uploadUrl } = await partUrlRes.json();
        assert(uploadUrl, 'Part upload URL must exist');

        // Extract chunk slice
        const start = (pNum - 1) * transferSession.chunkSize;
        const end = Math.min(start + transferSession.chunkSize, testBuffer.length);
        const chunkSlice = testBuffer.subarray(start, end);

        // Upload chunk with PUT
        const putUrl = uploadUrl.startsWith('http') ? uploadUrl : `${baseUrl}${uploadUrl}`;
        const putRes = await fetch(putUrl, {
          method: 'PUT',
          body: chunkSlice
        });
        assert.strictEqual(putRes.status, 200);
        const etag = putRes.headers.get('etag') || (await putRes.json()).ETag;
        assert(etag, 'Should receive ETag');
        completedParts.push({ PartNumber: pNum, ETag: etag });
      }

      // Complete file upload
      const compRes = await fetch(
        `${baseUrl}/api/transfers/${transferSession.transferId}/files/${fInfo.id}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-sender-token': transferSession.senderToken
          },
          body: JSON.stringify({ parts: completedParts })
        }
      );
      assert.strictEqual(compRes.status, 200);
      console.log(`   ✓ File "${fInfo.name}" (${fInfo.size} bytes) parts uploaded and completed`);
    }

    // 4. Finalize Transfer
    console.log('4. Testing Finalize Transfer ...');
    const finalizeRes = await fetch(`${baseUrl}/api/transfers/${transferSession.transferId}/finalize`, {
      method: 'POST',
      headers: {
        'x-sender-token': transferSession.senderToken
      }
    });
    assert.strictEqual(finalizeRes.status, 200);
    const finalizeData = await finalizeRes.json();
    assert.strictEqual(finalizeData.status, 'ready');
    console.log('   ✓ Transfer finalized and status is READY');

    // 5. Lookup Transfer by 6-digit Code (Receiver Flow)
    console.log('5. Testing Receiver Code Lookup ...');
    const codeRes = await fetch(`${baseUrl}/api/transfers/by-code/${transferSession.code}`);
    assert.strictEqual(codeRes.status, 200);
    const receiverData = await codeRes.json();
    assert.strictEqual(receiverData.transferId, transferSession.transferId);
    assert.strictEqual(receiverData.files.length, 2);
    assert.strictEqual(receiverData.files[0].originalName, 'document.pdf');
    console.log('   ✓ Receiver successfully looked up transfer metadata by 6-digit code');

    // 6. Download files & verify checksums
    console.log('6. Testing Authorized File Downloads & Data Integrity ...');
    for (let fIdx = 0; fIdx < receiverData.files.length; fIdx++) {
      const rf = receiverData.files[fIdx];
      const dlUrlRes = await fetch(
        `${baseUrl}/api/transfers/${receiverData.transferId}/files/${rf.id}/download-url`
      );
      assert.strictEqual(dlUrlRes.status, 200);
      const { downloadUrl } = await dlUrlRes.json();
      assert(downloadUrl, 'Download URL must be returned');

      const fullDlUrl = downloadUrl.startsWith('http') ? downloadUrl : `${baseUrl}${downloadUrl}`;
      const dlRes = await fetch(fullDlUrl);
      assert.strictEqual(dlRes.status, 200);
      const downloadedBuffer = Buffer.from(await dlRes.arrayBuffer());

      const expectedHash = fIdx === 0 ? file1Hash : file2Hash;
      const actualHash = crypto.createHash('sha256').update(downloadedBuffer).digest('hex');
      assert.strictEqual(actualHash, expectedHash, `Downloaded checksum for ${rf.name} must match exactly!`);
      console.log(`   ✓ File ${rf.name} downloaded (${downloadedBuffer.length} bytes) - SHA256 checksum matched!`);
    }

    // 7. Test Invalid Code Handling
    console.log('7. Testing Invalid Code Behavior ...');
    const invalidCodeRes = await fetch(`${baseUrl}/api/transfers/by-code/000000`);
    assert.strictEqual(invalidCodeRes.status, 404);
    const invalidErr = await invalidCodeRes.json();
    assert(invalidErr.error, 'Must return descriptive error');
    console.log('   ✓ Correct 404 response returned for invalid code');

    // 8. Revoke / Cancel Transfer (Sender Flow)
    console.log('8. Testing Sender Transfer Revocation ...');
    const revokeRes = await fetch(`${baseUrl}/api/transfers/${transferSession.transferId}`, {
      method: 'DELETE',
      headers: {
        'x-sender-token': transferSession.senderToken
      }
    });
    assert.strictEqual(revokeRes.status, 200);

    // Verify code lookup now fails with 410 Gone
    const afterRevokeRes = await fetch(`${baseUrl}/api/transfers/by-code/${transferSession.code}`);
    assert.strictEqual(afterRevokeRes.status, 410);
    console.log('   ✓ Transfer revoked and immediately inaccessible (410 Gone)');

    // 9. Run automated cleanup routine
    console.log('9. Testing Cleanup Service ...');
    const cleanupResult = await cleanupService.runCleanup();
    assert(typeof cleanupResult.expiredCount === 'number');
    console.log('   ✓ Cleanup routine completed successfully');

    console.log('\n🎉 ALL END-TO-END TESTS PASSED SUCCESSFULLY! 100% OPERATIONAL!\n');
  } finally {
    server.close();
  }
}

runE2eTests().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
