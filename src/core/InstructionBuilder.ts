/**
 * InstructionBuilder 类
 * 负责构建和验证 Prompt 指令。
 */
export class InstructionBuilder {
  /**
   * Builds the final instruction by replacing placeholders in the prompt template.
   * 
   * @param promptTemplate The raw prompt string containing placeholders like {{text}}.
   * @param variables A key-value map of variables to replace. e.g. { text: "Hello" }
   * @returns The processed prompt string.
   */
  public static build(promptTemplate: string, variables: Record<string, string>): string {
    if (!promptTemplate) return '';
    
    return promptTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return variables[key] !== undefined ? variables[key] : `{{${key}}}`;
    });
  }

  /**
   * Validates if all required variables are present in the variables map.
   * 
   * @param promptTemplate The raw prompt string.
   * @param variables The provided variables.
   * @returns True if all placeholders have corresponding values.
   */
  public static validate(promptTemplate: string, variables: Record<string, string>): boolean {
    const matches = promptTemplate.match(/\{\{(\w+)\}\}/g);
    if (!matches) return true;

    return matches.every(match => {
      const key = match.replace(/\{\{|\}\}/g, '');
      return variables[key] !== undefined;
    });
  }
}
