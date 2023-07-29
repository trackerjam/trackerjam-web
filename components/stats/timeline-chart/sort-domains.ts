import {HourlyData} from './get-hourly-data';

export function sortDomains(domains: string[], data: HourlyData[]) {
  // Initialize object to hold total values for each domain
  const domainTotals: {[domain: string]: number} = {};

  // Iterate over data points
  for (let i = 0; i < data.length; i++) {
    // Iterate over domains
    for (const domain of domains) {
      // If the data point has a value for this domain, add it to the total
      if (data[i][domain]) {
        domainTotals[domain] = (domainTotals[domain] || 0) + (data[i][domain] as number);
      }
    }
  }

  // Sort domains based on total values
  domains.sort((a, b) => domainTotals[a] - domainTotals[b]);

  return domains;
}
