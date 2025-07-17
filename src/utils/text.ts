/**
 * Replaces variables in template taking values from context
 * @param {string} template
 * @param {Object} context
 * @param {string} prefix
 * @returns {string}
 */
export function substring(template: string, context: object, prefix: string = ":"): string {
  for (const [key, value] of Object.entries(context)) {
    template = template.replace(`${prefix}${key}`, value);
  }
  return template;
}
