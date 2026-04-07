'use server';
/**
 * @fileOverview A Genkit flow for generating detailed streaming service product descriptions.
 *
 * - generateProductDescription - A function that handles the AI product description generation process.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productDetails: z
    .string()
    .describe(
      'Keywords or basic details about the streaming service product, e.g., "Netflix Premium, 4K, multiple profiles, no ads, shared account".'
    ),
});
export type GenerateProductDescriptionInput = z.infer<
  typeof GenerateProductDescriptionInputSchema
>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z
    .string()
    .describe('A detailed and compelling product description for the streaming service.'),
});
export type GenerateProductDescriptionOutput = z.infer<
  typeof GenerateProductDescriptionOutputSchema
>;

export async function generateProductDescription(
  input: GenerateProductDescriptionInput
): Promise<GenerateProductDescriptionOutput> {
  return adminAiProductDescriptionGenerationFlow(input);
}

const productDescriptionPrompt = ai.definePrompt({
  name: 'productDescriptionPrompt',
  input: {schema: GenerateProductDescriptionInputSchema},
  output: {schema: GenerateProductDescriptionOutputSchema},
  prompt: `You are an expert marketing copywriter specializing in creating compelling product descriptions for streaming service accounts.
Your goal is to generate a detailed, attractive, and persuasive product description based on the provided keywords and basic details.
Highlight the benefits and key features that would appeal to a potential customer looking for a streaming service.

Provided product details: {{{productDetails}}}

Generate a product description in markdown format that is at least 3 sentences long.`,
});

const adminAiProductDescriptionGenerationFlow = ai.defineFlow(
  {
    name: 'adminAiProductDescriptionGenerationFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await productDescriptionPrompt(input);
    return output!;
  }
);
