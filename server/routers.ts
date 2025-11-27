import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  files: router({
    upload: protectedProcedure
      .input(z.object({
        filename: z.string(),
        fileKey: z.string(),
        fileUrl: z.string(),
        mimeType: z.string().optional(),
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createFile, createQuestions } = await import("./db");
        const { extractQuestionsFromText } = await import("./gemini");

        // Save file to database
        const fileResult = await createFile({
          userId: ctx.user.id,
          filename: input.filename,
          fileKey: input.fileKey,
          fileUrl: input.fileUrl,
          mimeType: input.mimeType,
        });

        const fileId = Number(fileResult[0].insertId);

        // Extract questions using Gemini
        const questions = await extractQuestionsFromText(input.content);

        // Save questions to database
        if (questions.length > 0) {
          await createQuestions(
            questions.map((q) => ({
              fileId,
              question: q,
            }))
          );
        }

        return {
          fileId,
          questionsCount: questions.length,
        };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      const { getFilesByUserId } = await import("./db");
      return await getFilesByUserId(ctx.user.id);
    }),

    getQuestions: protectedProcedure
      .input(z.object({ fileId: z.number() }))
      .query(async ({ input }) => {
        const { getQuestionsByFileId } = await import("./db");
        return await getQuestionsByFileId(input.fileId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
