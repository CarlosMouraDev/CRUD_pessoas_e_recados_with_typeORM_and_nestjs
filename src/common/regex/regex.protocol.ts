export class RegexProtocol implements RegexProtocol {
  execute(str: string): string {
    return str.replace(/\s+/g, '');
  }
}
