export interface InsightItem {
   id: number
   num: string
   source: string
   title: string
   color: string
   href: string
}

const insightsData: InsightItem[] = [
   {
      id: 1,
      num: '01',
      source: 'World Bank Group',
      title: 'Global Economic Prospects',
      color: '#1565C0',
      href: 'https://www.worldbank.org/en/publication/global-economic-prospects',
   },
   {
      id: 2,
      num: '02',
      source: 'Harvard Business Review',
      title: 'Research: When Should Startups Scale?',
      color: '#8E24AA',
      href: 'https://hbr.org/2024/10/research-when-should-startups-scale',
   },
   {
      id: 3,
      num: '03',
      source: 'Knowledge at Wharton',
      title: 'Why the Most Successful Companies Are Scalable',
      color: '#2E7D32',
      href: 'https://knowledge.wharton.upenn.edu/article/why-the-most-successful-companies-are-scalable/',
   },
   {
      id: 4,
      num: '04',
      source: 'Boston Consulting Group (BCG)',
      title: 'Your Growth Strategy Depends on Your Starting Point',
      color: '#1565C0',
      href: 'https://www.bcg.com/publications/2024/your-revenue-strategy-depends-on-your-starting-point',
   },
   {
      id: 5,
      num: '05',
      source: 'First Round Review',
      title: 'The PMF Framework: How to Measure Product-Market Fit',
      color: '#0A3CC2',
      href: 'https://review.firstround.com/how-to-measure-product-market-fit/',
   },
   {
      id: 6,
      num: '06',
      source: 'Springer Nature',
      title: 'Why Early-Stage Software Startups Fail: A Behavioral Framework',
      color: '#2E7D32',
      href: 'https://link.springer.com/chapter/10.1007/978-3-319-08738-2_3',
   },
   {
      id: 7,
      num: '07',
      source: 'Y Combinator (Library)',
      title: 'How to Build a Great Series A Pitch and Deck',
      color: '#0A3CC2',
      href: 'https://www.ycombinator.com/library/8d-how-to-build-a-great-series-a-pitch-and-deck',
   },
   {
      id: 8,
      num: '08',
      source: 'McKinsey & Company',
      title: 'The Next Normal: The Future of Industries',
      color: '#1565C0',
      href: 'https://www.mckinsey.com/featured-insights/the-next-normal',
   },
   {
      id: 9,
      num: '09',
      source: 'Deloitte Insights',
      title: 'The Path to Profitability for High-Growth Startups',
      color: '#2E7D32',
      href: 'https://www.deloitte.com/uk/en/services/deloitte-private/blogs/2024/the-path-to-profitability.html',
   },
]

export default insightsData
