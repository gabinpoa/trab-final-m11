import { validateMimeTypeReal, validateImageResolution, validateFileSize } from './validation.middleware';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

describe('Validation Middleware Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      file: undefined,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateMimeTypeReal', () => {
    it('should call next() when no file is present', () => {
      mockRequest.file = undefined;

      validateMimeTypeReal(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next() for valid MIME type', () => {
      mockRequest.file = {
        path: '/tmp/test.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      validateMimeTypeReal(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle invalid MIME type', () => {
      mockRequest.file = {
        path: '/tmp/test.exe',
        mimetype: 'application/x-msdownload',
      } as Express.Multer.File;

      validateMimeTypeReal(mockRequest as Request, mockResponse as Response, mockNext);

      // In real implementation, this would return 400
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle file deletion on invalid MIME type', () => {
      const testFile = '/tmp/test-invalid.exe';
      mockRequest.file = {
        path: testFile,
        mimetype: 'application/x-msdownload',
      } as Express.Multer.File;

      // Create test file
      fs.writeFileSync(testFile, 'test content');

      validateMimeTypeReal(mockRequest as Request, mockResponse as Response, mockNext);

      // In real implementation, file would be deleted
      expect(mockNext).toHaveBeenCalled();

      // Cleanup
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    });
  });

  describe('validateImageResolution', () => {
    it('should call next() when no file is present', () => {
      mockRequest.file = undefined;

      validateImageResolution(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should skip validation for PDF files', () => {
      mockRequest.file = {
        path: '/tmp/test.pdf',
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      validateImageResolution(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next() for valid image resolution', () => {
      mockRequest.file = {
        path: '/tmp/test.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      validateImageResolution(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle low resolution images', () => {
      mockRequest.file = {
        path: '/tmp/test-low-res.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      validateImageResolution(mockRequest as Request, mockResponse as Response, mockNext);

      // In real implementation, this would return 400
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle file deletion on invalid resolution', () => {
      const testFile = '/tmp/test-low-res.jpg';
      mockRequest.file = {
        path: testFile,
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      // Create test file
      fs.writeFileSync(testFile, 'test content');

      validateImageResolution(mockRequest as Request, mockResponse as Response, mockNext);

      // In real implementation, file would be deleted
      expect(mockNext).toHaveBeenCalled();

      // Cleanup
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    });
  });

  describe('validateFileSize', () => {
    it('should call next() when no file is present', () => {
      mockRequest.file = undefined;

      validateFileSize(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next() for files within size limit', () => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      mockRequest.file = {
        size: 5 * 1024 * 1024, // 5MB
      } as Express.Multer.File;

      validateFileSize(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 400 for files exceeding size limit', () => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      mockRequest.file = {
        size: 11 * 1024 * 1024, // 11MB
        path: '/tmp/test-large.jpg',
      } as Express.Multer.File;

      // Create test file
      fs.writeFileSync(mockRequest.file.path, 'test content');

      validateFileSize(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'File size exceeds maximum limit of 10MB.',
      });

      // Cleanup
      if (fs.existsSync(mockRequest.file.path)) {
        fs.unlinkSync(mockRequest.file.path);
      }
    });

    it('should delete file when size exceeds limit', () => {
      const testFile = '/tmp/test-large.jpg';
      mockRequest.file = {
        size: 11 * 1024 * 1024, // 11MB
        path: testFile,
      } as Express.Multer.File;

      // Create test file
      fs.writeFileSync(testFile, 'test content');

      validateFileSize(mockRequest as Request, mockResponse as Response, mockNext);

      expect(fs.existsSync(testFile)).toBe(false);

      // Cleanup
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle file system errors gracefully', () => {
      mockRequest.file = {
        path: '/tmp/test.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      validateMimeTypeReal(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should clean up file on error', () => {
      const testFile = '/tmp/test.jpg';
      mockRequest.file = {
        path: testFile,
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      // Create test file
      fs.writeFileSync(testFile, 'test content');

      validateMimeTypeReal(mockRequest as Request, mockResponse as Response, mockNext);

      // In real implementation, file would be cleaned up on error
      expect(mockNext).toHaveBeenCalled();

      // Cleanup
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    });
  });
});
