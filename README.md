<div align="center">
  <img src="client/public/favicon.svg" alt="SendFiles logo" width="112" height="112">
  <h1>SendFiles</h1>
  <p><strong>Big files. No account. Just send.</strong></p>
  <p>Move files between your phone, tablet, and computer with a short code, a link, or a QR scan.</p>
  <p>
    <img src="https://img.shields.io/badge/license-MIT-4F46E5?style=for-the-badge" alt="MIT License">
    <img src="https://img.shields.io/badge/React-19-06B6D4?style=for-the-badge&logo=react&logoColor=white" alt="React 19">
    <img src="https://img.shields.io/badge/Node.js-22%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js 22 or newer">
    <img src="https://img.shields.io/badge/max_file_size-5_GB-7C3AED?style=for-the-badge" alt="Maximum file size: 5 GB">
  </p>
  <p>
    <img src="client/public/admin-dp.jpg" alt="Sk Sahil's profile picture" width="88" height="88" style="border-radius: 50%;">
    <br>
    Created by <strong>Sk Sahil</strong>
  </p>
</div>

---

## What is SendFiles?

**SendFiles is a self-hostable, cross-device file transfer app.** Choose files on one device, then open the transfer on another using a six-character code, a shareable link, or a QR code. No recipient account or app installation is needed.

Files are split into chunks while uploading. With an S3-compatible provider such as Cloudflare R2 configured, the browser sends those chunks directly to object storage using temporary signed URLs. In local mode, SendFiles stores the chunks on the server's disk instead. Transfers expire automatically; the default lifetime is **34 hours**.

> SendFiles is the software you can run yourself. You choose the host and storage provider, and their limits, costs, and persistence policies apply.

## How a transfer works

1. **Choose files** — select or drag in files (up to 5 GB each; up to 50 files per transfer).
2. **Upload** — SendFiles uploads in 10 MiB chunks and shows progress, speed, and estimated time remaining.
3. **Share** — copy the six-character code or link, or let the recipient scan the QR code.
4. **Receive** — open the link or enter the code on another device to view and download the files.
5. **Expire** — the transfer is automatically cleaned up after its configured lifetime (34 hours by default).


## Features

- **Cross-device sharing** with six-character transfer codes, deep links, and QR codes.
- **Large uploads** up to 5 GB per file and 50 files in one transfer.
- **Multipart uploads** using configurable 10 MiB chunks, with browser-side progress, speed, and ETA.
- **Upload controls** to pause, resume, cancel, or remove a transfer using the sender's authorization token.
- **Two storage modes:** local disk for development and S3-compatible object storage (including Cloudflare R2) for deployments.
- **Automatic expiration and cleanup** for completed transfers and abandoned multipart uploads.
- **No account required** for senders or recipients.
- **Responsive interface** with light and dark themes.
- **Transfer-code rate limiting** to make code guessing harder.

## License

SendFiles is released under the [MIT License](LICENSE).
