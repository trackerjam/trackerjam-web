import {LOCAL_FILE_STR} from '../../const/string';

export function extractDomain(url: string): string | null {
  try {
    const urlObject = new URL(url);
    const domain = urlObject.hostname;

    if (urlObject.protocol === 'file:') {
      return LOCAL_FILE_STR;
    }

    return domain.replace(/^www\./, '').toLocaleLowerCase();
  } catch (error) {
    return null;
  }
}
