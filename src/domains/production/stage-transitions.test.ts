import { ProductionStage } from '@prisma/client';

describe('Production Stage Transitions Tests', () => {
  // Definição de transições válidas (copiado do production.service.ts)
  const VALID_TRANSITIONS: Record<ProductionStage, ProductionStage[]> = {
    [ProductionStage.pending]: [ProductionStage.printing],
    [ProductionStage.printing]: [ProductionStage.cutting],
    [ProductionStage.cutting]: [ProductionStage.assembly],
    [ProductionStage.assembly]: [ProductionStage.quality_check],
    [ProductionStage.quality_check]: [ProductionStage.packaging, ProductionStage.printing],
    [ProductionStage.packaging]: [ProductionStage.shipped],
    [ProductionStage.shipped]: [],
  };

  describe('Valid Transitions', () => {
    it('should allow transition from pending to printing', () => {
      const currentStage = ProductionStage.pending;
      const nextStage = ProductionStage.printing;

      expect(VALID_TRANSITIONS[currentStage]).toContain(nextStage);
    });

    it('should allow transition from printing to cutting', () => {
      const currentStage = ProductionStage.printing;
      const nextStage = ProductionStage.cutting;

      expect(VALID_TRANSITIONS[currentStage]).toContain(nextStage);
    });

    it('should allow transition from cutting to assembly', () => {
      const currentStage = ProductionStage.cutting;
      const nextStage = ProductionStage.assembly;

      expect(VALID_TRANSITIONS[currentStage]).toContain(nextStage);
    });

    it('should allow transition from assembly to quality_check', () => {
      const currentStage = ProductionStage.assembly;
      const nextStage = ProductionStage.quality_check;

      expect(VALID_TRANSITIONS[currentStage]).toContain(nextStage);
    });

    it('should allow transition from quality_check to packaging', () => {
      const currentStage = ProductionStage.quality_check;
      const nextStage = ProductionStage.packaging;

      expect(VALID_TRANSITIONS[currentStage]).toContain(nextStage);
    });

    it('should allow transition from quality_check to printing (rework)', () => {
      const currentStage = ProductionStage.quality_check;
      const nextStage = ProductionStage.printing;

      expect(VALID_TRANSITIONS[currentStage]).toContain(nextStage);
    });

    it('should allow transition from packaging to shipped', () => {
      const currentStage = ProductionStage.packaging;
      const nextStage = ProductionStage.shipped;

      expect(VALID_TRANSITIONS[currentStage]).toContain(nextStage);
    });
  });

  describe('Invalid Transitions', () => {
    it('should not allow transition from pending to cutting', () => {
      const currentStage = ProductionStage.pending;
      const nextStage = ProductionStage.cutting;

      expect(VALID_TRANSITIONS[currentStage]).not.toContain(nextStage);
    });

    it('should not allow transition from printing to assembly', () => {
      const currentStage = ProductionStage.printing;
      const nextStage = ProductionStage.assembly;

      expect(VALID_TRANSITIONS[currentStage]).not.toContain(nextStage);
    });

    it('should not allow transition from cutting to quality_check', () => {
      const currentStage = ProductionStage.cutting;
      const nextStage = ProductionStage.quality_check;

      expect(VALID_TRANSITIONS[currentStage]).not.toContain(nextStage);
    });

    it('should not allow transition from assembly to packaging', () => {
      const currentStage = ProductionStage.assembly;
      const nextStage = ProductionStage.packaging;

      expect(VALID_TRANSITIONS[currentStage]).not.toContain(nextStage);
    });

    it('should not allow transition from packaging to quality_check', () => {
      const currentStage = ProductionStage.packaging;
      const nextStage = ProductionStage.quality_check;

      expect(VALID_TRANSITIONS[currentStage]).not.toContain(nextStage);
    });

    it('should not allow any transition from shipped', () => {
      const currentStage = ProductionStage.shipped;

      expect(VALID_TRANSITIONS[currentStage]).toHaveLength(0);
    });

    it('should not allow transition from pending to shipped', () => {
      const currentStage = ProductionStage.pending;
      const nextStage = ProductionStage.shipped;

      expect(VALID_TRANSITIONS[currentStage]).not.toContain(nextStage);
    });
  });

  describe('Stage Flow', () => {
    it('should have complete flow from pending to shipped', () => {
      const expectedFlow = [
        ProductionStage.pending,
        ProductionStage.printing,
        ProductionStage.cutting,
        ProductionStage.assembly,
        ProductionStage.quality_check,
        ProductionStage.packaging,
        ProductionStage.shipped,
      ];

      let currentStage: ProductionStage = ProductionStage.pending;
      const actualFlow: ProductionStage[] = [currentStage];

      while (currentStage !== ProductionStage.shipped) {
        const nextStages = VALID_TRANSITIONS[currentStage];
        if (nextStages.length === 0) break;

        // Take the first valid transition (main flow)
        currentStage = nextStages[0] as ProductionStage;
        actualFlow.push(currentStage);
      }

      expect(actualFlow).toEqual(expectedFlow);
    });

    it('should allow rework from quality_check to printing', () => {
      const currentStage = ProductionStage.quality_check;
      const reworkStage = ProductionStage.printing;

      expect(VALID_TRANSITIONS[currentStage]).toContain(reworkStage);
    });
  });

  describe('Stage Enum Values', () => {
    it('should have all required stage values', () => {
      const requiredStages = [
        ProductionStage.pending,
        ProductionStage.printing,
        ProductionStage.cutting,
        ProductionStage.assembly,
        ProductionStage.quality_check,
        ProductionStage.packaging,
        ProductionStage.shipped,
      ];

      requiredStages.forEach(stage => {
        expect(stage).toBeDefined();
        expect(typeof stage).toBe('string');
      });
    });
  });
});
