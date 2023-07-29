import {sortDomains} from '../sort-domains';

describe('sortDomains', () => {
  it('should sort domains based on total values across all data points', () => {
    const domains = [
      'google.com',
      'microsoft.com',
      'youtube.com',
      'wikipedia.org',
      'jetbrains.com',
      'bing.com',
      'apple.com',
    ];

    const data = [
      {
        id: '00',
        total: 16.966666666666665,
        'google.com': 2.8,
        'microsoft.com': 6.6,
        'youtube.com': 3.0166666666666666,
        'wikipedia.org': 2.216666666666667,
        'jetbrains.com': 0.31666666666666665,
        'bing.com': 0.65,
        'apple.com': 1.3666666666666667,
      },
      {
        id: '01',
        total: 19.966666666666665,
        'google.com': 3.8,
        'microsoft.com': 6.6,
        'youtube.com': 3.216666666666666,
        'wikipedia.org': 2.216666666666667,
        'jetbrains.com': 1.31666666666666665,
        'bing.com': 0.75,
        'apple.com': 1.466666666666666,
      },
      // Rest of your data points...
    ];

    const result = sortDomains(domains, data);

    expect(result).toEqual([
      'microsoft.com',
      'google.com',
      'youtube.com',
      'wikipedia.org',
      'apple.com',
      'jetbrains.com',
      'bing.com',
    ]);
  });

  it('should return original domains when data points have no domain values', () => {
    const domains = [
      'google.com',
      'microsoft.com',
      'youtube.com',
      'wikipedia.org',
      'jetbrains.com',
      'bing.com',
      'apple.com',
    ];

    const data = [
      {id: '00', total: 0},
      {id: '01', total: 0},
      // Rest of your data points with total: 0...
    ];

    const result = sortDomains(domains, data);

    expect(result).toEqual(domains);
  });
});
