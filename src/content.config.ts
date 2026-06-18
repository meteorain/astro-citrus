import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

function removeDupsAndLowerCase(array: string[]) {
	return [...new Set(array.map((str) => str.toLowerCase()))];
}

const baseSchema = z.object({
	title: z.string().max(60),
});

// post：内容来自 meteorain/content 的 posts 目录（WordPress 重导出，318 篇）。
// 转换器把 content 的 frontmatter（pubDatetime / modDatetime / categories / tags）
// 映射成 astro-citrus 主题所需的字段（publishDate / updatedDate / tags）。
const post = defineCollection({
	loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
	schema: ({ image }) =>
		z
			.object({
				// —— 主题原生字段（content 多数没有 → 默认值 / 可选）——
				title: z.string(), // 放宽 max(60)：content 标题可超 60 字符，不截断
				description: z.string().optional().default(""),
				coverImage: z
					.object({
						alt: z.string(),
						src: image(),
					})
					.optional(),
				draft: z.boolean().default(false),
				ogImage: z.string().optional(),
				seriesId: z.string().optional(),
				orderInSeries: z.number().optional(),
				// —— content（重导出）的原始字段 ——
				pubDatetime: z.coerce.date(),
				modDatetime: z.coerce.date().optional().nullable(),
				categories: z.array(z.string()).default([]),
				tags: z.array(z.string()).default([]),
			})
			.transform((d) => ({
				...d,
				// —— 字段映射：content → astro-citrus ——
				publishDate: d.pubDatetime,
				updatedDate: d.modDatetime ?? undefined,
				tags: removeDupsAndLowerCase([...d.categories, ...d.tags]),
			})),
});

const note = defineCollection({
	loader: glob({ base: "./src/content/note", pattern: "**/*.{md,mdx}" }),
	schema: baseSchema.extend({
		description: z.string().optional(),
		publishDate: z
			.string()
			.datetime({ offset: true }) // Ensures ISO 8601 format with offsets allowed (e.g. "2024-01-01T00:00:00Z" and "2024-01-01T00:00:00+02:00")
			.transform((val) => new Date(val)),
	}),
});

// Series
const series = defineCollection({
	loader: glob({ base: "./src/content/series", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		id: z.string(),
		title: z.string(),
		description: z.string(),
		featured: z.boolean().default(false), // Пометка для популярных серий
	}),
});
// End

// Series
export const collections = { post, note, series };
