import { v4 as uuidv4 } from 'uuid';
import { z } from "zod";
import 'react-native-get-random-values';

export const CategorySchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, "Name required"),
    icon: z.string().min(1, "Icon required"),
    type: z.enum(["income", "expense"]),
    color: z.string().optional(),
    isDefault: z.boolean().optional(),
    updatedAt: z.date(),
    deletedAt: z.date().optional().nullable(),
});

export type Category = z.infer<typeof CategorySchema>;

export const createCategory = (
    name: string,
    icon: string,
    type: "income" | "expense",
    color?: string,
    isDefault: boolean = false
): Category => {
    const category = {
        id: uuidv4(),
        name,
        icon,
        type,
        color,
        isDefault,
        updatedAt: new Date(),
    };

    return CategorySchema.parse(category);
};
