import { Injectable, Logger } from "@nestjs/common";
import OpenAI from "openai";
import { ConfigService } from "../../config/config.service";

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private openai: OpenAI | null = null;
  private readonly embedModel: string;
  private readonly maxLength: number;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.openaiApiKey;
    const baseURL = this.configService.openaiBaseUrl;
    this.embedModel = this.configService.openaiEmbedModel;
    this.maxLength = this.configService.openaiEmbedMaxTokens;
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        baseURL: baseURL || undefined,
      });
    } else {
      this.logger.warn(
        "OPENAI_API_KEY not configured, embeddings will not work"
      );
    }
  }

  /**
   * Generate embedding for text using OpenAI
   */
  async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.openai) {
      this.logger.warn("OpenAI client not initialized, returning null");
      return null;
    }

    try {
      // Truncate text for safety (tokenization varies by model)
      // Rough heuristic: 1 token ~ 4 chars
      const truncatedText =
        text.length > this.maxLength ? text.substring(0, this.maxLength) : text;

      const response = await this.openai.embeddings.create({
        model: this.embedModel,
        input: truncatedText,
      });

      return response.data[0]?.embedding || null;
    } catch (error: any) {
      this.logger.error("Failed to generate embedding:", error);
      return null;
    }
  }

  /**
   * Generate embedding for a news item (title + description)
   */
  async generateNewsItemEmbedding(
    title: string,
    description: string
  ): Promise<number[] | null> {
    const text = `${title}\n\n${description}`;
    return this.generateEmbedding(text);
  }

  /**
   * Generate embedding for a news item using full text content when available.
   */
  async generateNewsItemContentEmbedding(params: {
    title: string;
    description: string;
    contentText?: string | null;
  }): Promise<number[] | null> {
    const parts = [params.title, params.description, params.contentText]
      .map((s) => (s || "").trim())
      .filter((s) => s.length > 0);
    return this.generateEmbedding(parts.join("\n\n"));
  }
}
