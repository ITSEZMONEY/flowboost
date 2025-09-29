import puppeteer from 'puppeteer'
import { supabase } from './supabase'

export interface CrawlResult {
  url: string
  title?: string
  metaDescription?: string
  h1Tags: string[]
  h2Tags: string[]
  imageCount: number
  imagesWithoutAlt: number
  internalLinks: number
  externalLinks: number
  contentLength: number
  loadTime: number
  statusCode: number
  issues: SEOIssue[]
}

export interface SEOIssue {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  suggestedFix?: string
}

export class SEOCrawler {
  private browser: puppeteer.Browser | null = null

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  async crawlPage(url: string): Promise<CrawlResult> {
    if (!this.browser) {
      await this.init()
    }

    const page = await this.browser!.newPage()
    const startTime = Date.now()

    try {
      const response = await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      })

      const loadTime = Date.now() - startTime
      const statusCode = response?.status() || 0

      // Extract page data
      const pageData = await page.evaluate(() => {
        const title = document.querySelector('title')?.textContent || ''
        const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || ''

        const h1Tags = Array.from(document.querySelectorAll('h1')).map(h => h.textContent || '')
        const h2Tags = Array.from(document.querySelectorAll('h2')).map(h => h.textContent || '')

        const images = Array.from(document.querySelectorAll('img'))
        const imageCount = images.length
        const imagesWithoutAlt = images.filter(img => !img.alt || img.alt.trim() === '').length

        const links = Array.from(document.querySelectorAll('a[href]'))
        const currentDomain = window.location.hostname
        let internalLinks = 0
        let externalLinks = 0

        links.forEach(link => {
          const href = link.getAttribute('href')
          if (href) {
            if (href.startsWith('http') && !href.includes(currentDomain)) {
              externalLinks++
            } else if (href.startsWith('/') || href.includes(currentDomain)) {
              internalLinks++
            }
          }
        })

        const contentLength = document.body.textContent?.length || 0

        return {
          title,
          metaDescription,
          h1Tags,
          h2Tags,
          imageCount,
          imagesWithoutAlt,
          internalLinks,
          externalLinks,
          contentLength
        }
      })

      const issues = this.detectSEOIssues({
        ...pageData,
        url,
        loadTime,
        statusCode
      })

      await page.close()

      return {
        url,
        ...pageData,
        loadTime,
        statusCode,
        issues
      }
    } catch (error) {
      await page.close()
      throw new Error(`Failed to crawl ${url}: ${error}`)
    }
  }

  private detectSEOIssues(data: any): SEOIssue[] {
    const issues: SEOIssue[] = []

    // Title issues
    if (!data.title || data.title.trim() === '') {
      issues.push({
        type: 'missing_title',
        severity: 'critical',
        description: 'Page is missing a title tag',
        suggestedFix: 'Add a descriptive title tag (50-60 characters)'
      })
    } else if (data.title.length > 60) {
      issues.push({
        type: 'title_too_long',
        severity: 'medium',
        description: `Title is too long (${data.title.length} characters)`,
        suggestedFix: 'Shorten title to 50-60 characters'
      })
    } else if (data.title.length < 30) {
      issues.push({
        type: 'title_too_short',
        severity: 'low',
        description: `Title is too short (${data.title.length} characters)`,
        suggestedFix: 'Expand title to 30-60 characters'
      })
    }

    // Meta description issues
    if (!data.metaDescription || data.metaDescription.trim() === '') {
      issues.push({
        type: 'missing_meta_description',
        severity: 'high',
        description: 'Page is missing a meta description',
        suggestedFix: 'Add a compelling meta description (150-160 characters)'
      })
    } else if (data.metaDescription.length > 160) {
      issues.push({
        type: 'meta_description_too_long',
        severity: 'medium',
        description: `Meta description is too long (${data.metaDescription.length} characters)`,
        suggestedFix: 'Shorten meta description to 150-160 characters'
      })
    }

    // H1 issues
    if (data.h1Tags.length === 0) {
      issues.push({
        type: 'missing_h1',
        severity: 'high',
        description: 'Page is missing an H1 tag',
        suggestedFix: 'Add a descriptive H1 tag that includes your target keyword'
      })
    } else if (data.h1Tags.length > 1) {
      issues.push({
        type: 'multiple_h1',
        severity: 'medium',
        description: `Page has multiple H1 tags (${data.h1Tags.length})`,
        suggestedFix: 'Use only one H1 tag per page'
      })
    }

    // Image alt text issues
    if (data.imagesWithoutAlt > 0) {
      issues.push({
        type: 'images_missing_alt',
        severity: 'medium',
        description: `${data.imagesWithoutAlt} images are missing alt text`,
        suggestedFix: 'Add descriptive alt text to all images for accessibility and SEO'
      })
    }

    // Content length issues
    if (data.contentLength < 300) {
      issues.push({
        type: 'thin_content',
        severity: 'medium',
        description: `Page has thin content (${data.contentLength} characters)`,
        suggestedFix: 'Add more valuable, relevant content (aim for 300+ words)'
      })
    }

    // Performance issues
    if (data.loadTime > 3000) {
      issues.push({
        type: 'slow_loading',
        severity: 'high',
        description: `Page loads slowly (${Math.round(data.loadTime / 1000)}s)`,
        suggestedFix: 'Optimize images, minify CSS/JS, and consider using a CDN'
      })
    }

    return issues
  }

  async crawlSite(siteId: string, domain: string, maxPages = 50): Promise<void> {
    const startUrls = [
      `https://${domain}`,
      `https://${domain}/sitemap.xml`
    ]

    const crawledUrls = new Set<string>()
    const urlQueue = [...startUrls]

    try {
      await this.init()

      while (urlQueue.length > 0 && crawledUrls.size < maxPages) {
        const url = urlQueue.shift()!

        if (crawledUrls.has(url)) continue
        crawledUrls.add(url)

        try {
          console.log(`Crawling: ${url}`)
          const result = await this.crawlPage(url)

          // Save issues to database
          for (const issue of result.issues) {
            await supabase.from('seo_issues').insert({
              site_id: siteId,
              page_url: url,
              issue_type: issue.type,
              severity: issue.severity,
              description: issue.description,
              suggested_fix: issue.suggestedFix
            })
          }

          // TODO: Extract more URLs from the page for deeper crawling

        } catch (error) {
          console.error(`Error crawling ${url}:`, error)

          // Save crawl error as an issue
          await supabase.from('seo_issues').insert({
            site_id: siteId,
            page_url: url,
            issue_type: 'crawl_error',
            severity: 'high',
            description: `Failed to crawl page: ${error}`,
            suggested_fix: 'Check if the page is accessible and fix any server errors'
          })
        }
      }

      // Update site's last crawl time
      await supabase.from('sites').update({
        last_crawl: new Date().toISOString()
      }).eq('id', siteId)

    } finally {
      await this.close()
    }
  }
}

export async function startSiteCrawl(siteId: string, domain: string) {
  const crawler = new SEOCrawler()

  try {
    await crawler.crawlSite(siteId, domain)

    // Calculate health score based on issues
    const { data: issues } = await supabase
      .from('seo_issues')
      .select('severity')
      .eq('site_id', siteId)
      .eq('is_fixed', false)

    let healthScore = 100
    if (issues) {
      issues.forEach(issue => {
        switch (issue.severity) {
          case 'critical': healthScore -= 20; break
          case 'high': healthScore -= 10; break
          case 'medium': healthScore -= 5; break
          case 'low': healthScore -= 2; break
        }
      })
    }

    healthScore = Math.max(0, healthScore)

    await supabase.from('sites').update({
      health_score: healthScore
    }).eq('id', siteId)

    return { success: true, healthScore }
  } catch (error) {
    console.error('Crawl failed:', error)
    return { success: false, error: error }
  }
}