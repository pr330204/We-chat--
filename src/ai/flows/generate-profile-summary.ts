'use server';

/**
 * @fileOverview Profile summary generator.
 *
 * - generateProfileSummary - A function that generates a profile summary based on the user's first name and last initial.
 * - GenerateProfileSummaryInput - The input type for the generateProfileSummary function.
 * - GenerateProfileSummaryOutput - The return type for the generateProfileSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProfileSummaryInputSchema = z.object({
  firstName: z.string().describe('The first name of the user.'),
  lastInitial: z.string().describe('The last initial of the user.'),
});
export type GenerateProfileSummaryInput = z.infer<
  typeof GenerateProfileSummaryInputSchema
>;

const GenerateProfileSummaryOutputSchema = z.object({
  summary: z.string().describe('A short (1-2 sentences) profile summary.'),
});
export type GenerateProfileSummaryOutput = z.infer<
  typeof GenerateProfileSummaryOutputSchema
>;

export async function generateProfileSummary(
  input: GenerateProfileSummaryInput
): Promise<GenerateProfileSummaryOutput> {
  return generateProfileSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProfileSummaryPrompt',
  input: {schema: GenerateProfileSummaryInputSchema},
  output: {schema: GenerateProfileSummaryOutputSchema},
  prompt: `You are a creative writer tasked with generating short, engaging profile summaries.

  Based on the user's first name and last initial, create a 1-2 sentence profile summary.

  First Name: {{{firstName}}}
  Last Initial: {{{lastInitial}}}
  `,
});

const generateProfileSummaryFlow = ai.defineFlow(
  {
    name: 'generateProfileSummaryFlow',
    inputSchema: GenerateProfileSummaryInputSchema,
    outputSchema: GenerateProfileSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
