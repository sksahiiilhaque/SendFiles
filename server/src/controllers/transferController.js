import { transferService } from '../services/transferService.js';

function getServerOrigin(req) {
  const host = req.get('host');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  return `${protocol}://${host}`;
}

export const transferController = {
  async createTransfer(req, res, next) {
    try {
      const { files, expiryHours } = req.body;
      const serverOrigin = getServerOrigin(req);

      const result = await transferService.createTransfer({
        files,
        expiryHours,
        serverOrigin
      });

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async getPartUploadUrl(req, res, next) {
    try {
      const { id: transferId, fileId } = req.params;
      const { partNumber } = req.query;
      const senderToken = req.headers['x-sender-token'] || req.query.senderToken;
      const serverOrigin = getServerOrigin(req);

      if (!senderToken) {
        return res.status(401).json({ error: 'x-sender-token header is required' });
      }

      const result = await transferService.getPartUploadUrl({
        transferId,
        fileId,
        partNumber,
        senderToken,
        serverOrigin
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async completeFile(req, res, next) {
    try {
      const { id: transferId, fileId } = req.params;
      const { parts } = req.body;
      const senderToken = req.headers['x-sender-token'] || req.body.senderToken;

      if (!senderToken) {
        return res.status(401).json({ error: 'x-sender-token header is required' });
      }

      if (!parts || !Array.isArray(parts) || parts.length === 0) {
        return res.status(400).json({ error: 'Valid parts array is required to complete file upload' });
      }

      const result = await transferService.completeFileUpload({
        transferId,
        fileId,
        parts,
        senderToken
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async finalizeTransfer(req, res, next) {
    try {
      const { id: transferId } = req.params;
      const senderToken = req.headers['x-sender-token'] || req.body.senderToken;

      if (!senderToken) {
        return res.status(401).json({ error: 'x-sender-token header is required' });
      }

      const result = await transferService.finalizeTransfer({
        transferId,
        senderToken
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getTransferByCode(req, res, next) {
    try {
      const code = req.cleanCode;
      const result = await transferService.getTransferByCode(code);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getTransferById(req, res, next) {
    try {
      const { id: transferId } = req.params;
      const result = await transferService.getTransferById(transferId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getFileDownloadUrl(req, res, next) {
    try {
      const { id: transferId, fileId } = req.params;
      const serverOrigin = getServerOrigin(req);

      const result = await transferService.getFileDownloadUrl({
        transferId,
        fileId,
        serverOrigin
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async revokeTransfer(req, res, next) {
    try {
      const { id: transferId } = req.params;
      const senderToken = req.headers['x-sender-token'] || req.body.senderToken || req.query.senderToken;

      if (!senderToken) {
        return res.status(401).json({ error: 'x-sender-token header is required' });
      }

      const result = await transferService.revokeTransfer({
        transferId,
        senderToken
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  }
};
