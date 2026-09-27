import { Response, NextFunction } from 'express';
import productService from '../services/product.service';
import logger from '../../../shared/utils/logger';
import path from 'path';

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Catalog]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
export const getAll = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { skip, take, categoryId } = req.query;

    const products = await productService.getAll({
      skip: skip ? parseInt(skip as string) : undefined,
      take: take ? parseInt(take as string) : undefined,
      categoryId: categoryId as string,
    });

    res.json(products);
  } catch (error) {
    logger.error({ error }, 'Error in getAll products controller');
    next(error);
  }
};

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Catalog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
export const getById = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await productService.getById(id);
    res.json(product);
  } catch (error) {
    logger.error({ error }, 'Error in getById product controller');
    next(error);
  }
};

/**
 * @swagger
 * /products/category/{categoryId}:
 *   get:
 *     summary: Get products by category
 *     tags: [Catalog]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of products in category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
export const getByCategory = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const products = await productService.getByCategory(categoryId);
    res.json(products);
  } catch (error) {
    logger.error({ error }, 'Error in getByCategory controller');
    next(error);
  }
};

/**
 * @swagger
 * /products/search:
 *   get:
 *     summary: Search products
 *     tags: [Catalog]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
export const search = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q) {
      res.status(400).json({
        message: 'Search query is required',
      });
      return;
    }

    const products = await productService.search(q as string);
    res.json(products);
  } catch (error) {
    logger.error({ error }, 'Error in search controller');
    next(error);
  }
};

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create new product with photo
 *     tags: [Catalog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - categoryId
 *               - photo
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               complexity:
 *                 type: integer
 *               categoryId:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
export const create = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, price, complexity, categoryId } = req.body;

    if (!name || !price || !categoryId) {
      res.status(400).json({
        message: 'Name, price, categoryId, and photo are required',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        message: 'Photo is required',
      });
      return;
    }

    // Criar produto primeiro para obter o ID
    const product = await productService.create({
      name,
      description,
      price,
      complexity,
      categoryId,
      imageUrl: '', // Será atualizado após mover o arquivo
    });

    // Mover arquivo para o diretório correto com o ID do produto
    const fs = require('fs');
    const path = require('path');
    
    const tempPath = req.file.path;
    const targetDir = path.join(process.cwd(), 'uploads', 'products', product.id);
    const targetPath = path.join(targetDir, req.file.filename);

    // Criar diretório se não existir
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Mover arquivo
    fs.renameSync(tempPath, targetPath);

    // Atualizar produto com a URL correta
    const photoUrl = `/uploads/products/${product.id}/${req.file.filename}`;
    const updatedProduct = await productService.update(product.id, {
      imageUrl: photoUrl,
    });

    res.status(201).json(updatedProduct);
  } catch (error) {
    logger.error({ error }, 'Error in create product controller');
    next(error);
  }
};

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Catalog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               complexity:
 *                 type: integer
 *               categoryId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
export const update = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, complexity, categoryId } = req.body;

    const product = await productService.update(id, {
      name,
      description,
      price,
      complexity,
      categoryId,
    });

    res.json(product);
  } catch (error) {
    logger.error({ error }, 'Error in update product controller');
    next(error);
  }
};

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Catalog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 */
export const deleteProduct = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await productService.delete(id);
    res.json(result);
  } catch (error) {
    logger.error({ error }, 'Error in delete product controller');
    next(error);
  }
};

/**
 * @swagger
 * /products/{id}/photo:
 *   patch:
 *     summary: Update product photo
 *     tags: [Catalog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product photo updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
export const updatePhoto = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.file) {
      res.status(400).json({
        message: 'Photo is required',
      });
      return;
    }

    // Construir URL da foto
    const photoUrl = `/uploads/products/${id}/${req.file.filename}`;

    const product = await productService.update(id, {
      imageUrl: photoUrl,
    });

    res.json(product);
  } catch (error) {
    logger.error({ error }, 'Error in updatePhoto controller');
    next(error);
  }
};

/**
 * @swagger
 * /products/{id}/photo:
 *   delete:
 *     summary: Delete product photo
 *     tags: [Catalog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product photo deleted
 */
export const deletePhoto = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Remover arquivo do sistema de arquivos
    const fs = require('fs');
    const product = await productService.getById(id);

    if (product && product.imageUrl) {
      const photoPath = path.join(process.cwd(), product.imageUrl);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    // Atualizar produto sem foto
    const updatedProduct = await productService.update(id, {
      imageUrl: '',
    });

    res.json(updatedProduct);
  } catch (error) {
    logger.error({ error }, 'Error in deletePhoto controller');
    next(error);
  }
};
