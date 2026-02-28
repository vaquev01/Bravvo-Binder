/**
 * Zod Validators - Validação de dados de entrada
 * Use esses schemas antes de salvar no banco.
 */
import { z } from 'zod';

// --- Auth ---
export const loginSchema = z.object({
    username: z.string().min(1, 'username é obrigatório'),
    password: z.string().min(1, 'password é obrigatório'),
    remember: z.boolean().optional()
});

// --- Workspace ---
export const workspaceDataSchema = z.object({
    clientName: z.string().optional(),
    vaults: z.record(z.any()).optional(),
    kpis: z.array(z.any()).optional(),
    dashboard: z.record(z.any()).optional(),
    governanceHistory: z.array(z.any()).optional()
}).passthrough(); // Permite campos extras para flexibilidade

// --- Vault Complete ---
export const vaultCompleteSchema = z.object({
    content: z.record(z.any()).refine(obj => Object.keys(obj).length > 0, {
        message: 'content é obrigatório e não pode ser vazio'
    })
});

// --- AI Generation ---
export const generatePlanSchema = z.object({
    vaults: z.record(z.any()).refine(obj => Object.keys(obj).length > 0, {
        message: 'Vaults são obrigatórios'
    }),
    kpis: z.array(z.any()).optional(),
    weights: z.record(z.any()).nullable().optional()
});

export const inspireVaultSchema = z.object({
    vaultId: z.string().min(1, 'vaultId é obrigatório'),
    currentData: z.record(z.any()).optional().default({}),
    mode: z.enum(['all', 'empty']).optional().default('all')
});

export const creativeBriefSchema = z.object({
    item: z.record(z.any()),
    vaults: z.record(z.any())
});

export const brandThemeSchema = z.object({
    vaults: z.record(z.any())
});

export const governanceConclusionSchema = z.object({
    ata: z.record(z.any())
});

/**
 * Middleware factory: valida req.body com um schema Zod
 */
export function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errors = result.error.errors.map(e => e.message).join(', ');
            return res.status(400).json({ error: errors });
        }
        req.validated = result.data;
        next();
    };
}
