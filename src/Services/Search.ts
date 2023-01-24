import algoliasearch from "algoliasearch"
import algoliarecommend from "@algolia/recommend"

// ALGOLIA SEARCH

export const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_SEARCH_KEY,
)

export const searchIndexGenerative = algoliaClient.initIndex(
  process.env.ALGOLIA_INDEX_GENERATIVE
)
export const searchIndexMarketplace = algoliaClient.initIndex(
  process.env.ALGOLIA_INDEX_MARKETPLACE
)
export const searchIndexUser = algoliaClient.initIndex(
  process.env.ALGOLIA_INDEX_USERS
)
export const searchIndexArticles = algoliaClient.initIndex(
  process.env.ALGOLIA_INDEX_ARTICLES
)

// ALGOLIA RECOMMEND

export const algoliaRecommendClient = algoliarecommend(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_SEARCH_KEY,
)

