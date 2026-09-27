import { Response, NextFunction } from 'express';
import materialService from '../services/material.service';
import logger from '../../../shared/utils/logger';

/**
 * @swagger
 * /materials:
 *   get:
 *     summary: Get all materials
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of materials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Material'
 */
export const getAll = async (_req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const materials = await materialService.getAll();
    res.json(materials);
  } catch (error) {
    logger.error({ error }, 'Error in getAll materials controller');
    next(error);
  }
};

/**
 * @swagger
 * /materials/{id}:
 *   get:
 *     summary: Get material by ID
 *     tags: [Inventory]
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
 *         description: Material details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Material'
 *       404:
 *         description: Material not found
 */
export const getById = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const material = await materialService.getById(id);
    res.json(material);
  } catch (error) {
    logger.error({ error }, 'Error in getById material controller');
    next(error);
  }
};

/**
 * @swagger
 * /materials:
 *   post:
 *     summary: Create new material
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - quantity
 *             properties:
 *               name:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               minLevel:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Material created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Material'
 */
export const create = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, quantity, minLevel } = req.body;

    if (!name || quantity === undefined) {
      res.status(400).json({
        message: 'Name and quantity are required',
      });
      return;
    }

    const material = await materialService.create({ name, quantity, minLevel });
    res.status(201).json(material);
  } catch (error) {
    logger.error({ error }, 'Error in create material controller');
    next(error);
  }
};

/**
 * @swagger
 * /materials/{id}:
 *   put:
 *     summary: Update material
 *     tags: [Inventory]
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
 *               quantity:
 *                 type: integer
 *               minLevel:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Material updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Material'
 */
export const update = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, quantity, minLevel } = req.body;

    const material = await materialService.update(id, { name, quantity, minLevel });
    res.json(material);
  } catch (error) {
    logger.error({ error }, 'Error in update material controller');
    next(error);
  }
};

/**
 * @swagger
 * /materials/{id}:
 *   delete:
 *     summary: Delete material
 *     tags: [Inventory]
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
 *         description: Material deleted
 */
export const deleteMaterial = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await materialService.delete(id);
    res.json(result);
  } catch (error) {
    logger.error({ error }, 'Error in delete material controller');
    next(error);
  }
};

/**
 * @swagger
 * /materials/availability:
 *   get:
 *     summary: Get available materials
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available materials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Material'
 */
export const getAvailability = async (_req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const materials = await materialService.getAvailableMaterials();
    res.json(materials);
  } catch (error) {
    logger.error({ error }, 'Error in getAvailability controller');
    next(error);
  }
};
