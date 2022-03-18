CHANGELOG
=======

> This file will be used to keep track of the changes made to the API to inform the consumers about what they need to update in their applications.


# (TO DELETE) Migration strategy

* transfer the new schema
* adapt the codebase so that old methods can cover the new schema
* add all the required entrypoints to cover the new schema
* add the new entities to the API
* optimize where it's possible
* test properly


# Changelog

## API self documentation

Most of the API endpoints / properties are now properly documented, which should make its usage easier.


## `offer` => `listing`

Fxhash used to call its listings `OFFERS`, which used to create a lot of confusion for the ecosystem. All the endpoints and keywords related to was used to be called offers were renamed into listings.


## `listing` is now a polymorphic entity for both marketplace contracts

The entity `listing` encapsulates the 2 marketplace contracts, and so there are some colliding ids. To solve this issue, a new field was added to the listing, called `version`. The identifier of a listing is now defined by its `(id, version)` pair.


## Objkts no longer have a single `offer`

The indexer doesn't delete the offers anymore when cancelled/accepted, but instead it sets a `cancelledAt` / `acceptedAt` field to the moment when the action was performed. It's now possible to retreive the full history of an objkt listings.

The field `activeListing` was added to replace the behaviour of the previous `offer` field.


## `generativeToken { offers }` becomes `generativeToken { activeListedObjkts }` 

The endpoint was renamed because there used to be some inconsistency in the naming (it was called offers but it returned the objkts with active offers instead). The endpoint have the same features as before it was only renamed for clarity.


## Removed `generativeToken { latestObjkts }` 

It was removed as the feature is covered by `generativeToken { objkts }` with pagination.


## Removed `generativeToken { latestActions }`

It was removed as the feature is covered by `generativeToken { actions }` with pagination.


## Collaboration contracts

The API now supports the collaboration contracts. Since on the blockchain, contracts have addresses in a similar fashion than users do, they share a lot of common properties. The `User` entity is now a **polymorphic** entity which support all types of accounts. A new `{ type }` field was added to the user entity, and for now it can take one of 2 values:

* `REGULAR`: a regular user
* `COLLAB_CONTRACT_V1`: a collaboration contract

When using the API, and especially when you want to display the author(s) of a token, it is advised to not only query the author as you used to but also query the `type` and `collaborators` fields:

```gql
generativeTokens {
  id
  name
  author {
    id
    type
    collaborators {
      id
      name
    }
  }
}
```

Which can, for instance, output something like this:

```json
[
  {
    "id": 5510,
    "name": "Random Token Name",
    "author": {
      "collaborators": [
        {
          "id": "tz1gbxFTPotmdLwCJ766md8XHVT9csB8Rzuz",
          "name": null
        },
        {
          "id": "tz1hi1BA8bW1gTqp3JSQmHbEhCy4zH8y9fMq",
          "name": "ciphrd?"
        }
      ],
      "type": "COLLAB_CONTRACT_V1",
      "id": "KT1KWxjcUhKNNtiMhmKP35DsTjfv3r2XY4XR"
    }
  },
  {
    "id": 5499,
    "name": "GPU !!",
    "author": {
      "collaborators": null,
      "type": "REGULAR",
      "id": "tz1gbxFTPotmdLwCJ766md8XHVT9csB8Rzuz"
    }
  }
]
```

This way, you ensure that regardless of who authored the Generative Token, you can get back to all the authors by testing the `type` property, and eventually looping through the collaborators.


## Dropping `user { actionsAsIssuer, actionsAsTarget }`

These endpoint were not very useful and were poluting the API. They are now dropped, and the `user { actions }` endpoint should be used instead.


## `generativeToken { price }` removed

fxhash now supports different pricing strategies for the Generative Tokens. For this reason, it's not possible anymore to have a single `price` field returning the accurate price of a token.

There are now 2 different pricing methods:

* **Fixed pricing**: a fixed price, the same as before, but now comes with the possiblity to schedule an opening time for a token.
* **Dutch Auction**: a price which decreases by levels at fixed intervals, with an opening time.

These different pricing methods can be fetched likeso:

```graphql
query GenerativeTokens {
  generativeTokens {
    id
    name
    pricingFixed {
      price
      opensAt
    }
    pricingDutchAuction {
      levels
      restingPrice
      decrementDuration
      opensAt
    }
  }
}
```

Which can output:

```json
[
  {
    "id": 5511,
    "name": "Random Token Name",
    "pricingFixed": null,
    "pricingDutchAuction": {
      "levels": [
        10000000,
        8000000,
        6000000,
        4000000,
        2000000
      ],
      "restingPrice": 2000000,
      "decrementDuration": 600,
      "opensAt": "2022-03-15T10:38:01.000Z"
    }
  },
  {
    "id": 5510,
    "name": "Random Token Name",
    "pricingFixed": {
      "price": 100000,
      "opensAt": null
    },
    "pricingDutchAuction": null
  }
]
```

The following javascript function can be used to output the current price of a token based on local time of the machine the code runs on:

```js
/**
 * Given a Generative Token (with loaded pricingFixed OR pricingDutchAuction),
 * outputs the price at the time of the transaction.
 * For pricing fixed, the price will be the constant, for pricing dutch auction
 * the price will be derived from the transaction time.
 */
export function getGenerativeTokenPrice(token) {
  if (!token.pricingFixed && !token.pricingDutchAuction) {
    throw new Error(`Cannot determine token #${token.id} price because it doesn't have a pricingFixed nor princingDutchAuction`)
  }

  // if the token has a pricing fixed, we can just return this value
  if (token.pricingFixed) {
    return token.pricingFixed.price
  }
  // otherwise we need to derive the price from the time of the transaction
  else if (token.pricingDutchAuction) {
    const { opensAt, levels, decrementDuration } = token.pricingDutchAuction

    // compute the time difference (in seconds) between opens and mint time
    const timeDiff = (Date.now() - opensAt.getTime()) / 1000
    // find the index of the level based on this time difference
    const index = Math.min(
      Math.floor(timeDiff / parseInt(decrementDuration)),
      levels.length-1
    )

    // return corresponding level
    return parseInt(levels[index])
  }

  throw new Error("something definitely went wrong")
}
```

The `generativeToken { price }` field is now deleted.

**Please note that if you want your front-end to be reactive with the current price of a Dutch Auction, you must implement a function which refreshes the price when needed, either with a periodic refresh or a programmatic one based on the dutch auction parameters.**


## Dropping endpoint `generativeTokensByIds {}`

The endpoint was dropped in favor of adding appropriate filter to the more generic `generativeTokens{}` endpoint.

You can perform the same operation as before using:

```gql
query GenerativeTokens($filters: GenerativeTokenFilter) {
  generativeTokens(filters: $filters) {
    id
    name
    lockEnd
    createdAt
  }
}
```

Variables:

```json
{
  "filters": {
    "id_in": [4, 5]
  }
}
```

Will output:

```json
{
  "data": {
    "generativeTokens": [
      {
        "id": 5,
        "name": "Random Token Name",
        "lockEnd": "2021-12-24T13:23:43.000Z",
        "createdAt": "2021-12-24T13:23:43.000Z"
      },
      {
        "id": 4,
        "name": "Random Token Name",
        "lockEnd": "2021-12-23T14:35:07.000Z",
        "createdAt": "2021-12-23T14:35:07.000Z"
      }
    ]
  }
}
```


## Dropping endpoints `lockedGenerativeTokens{}` and `reportedGenerativeTokens{}`

Some filters were added to the generic `generativeTokens{}` endpoint so that the same results can be fetched through the same endpoint.

The filters in question are:

* locked_eq: Boolean
* flag_eq: GenTokFlag
* flag_in: [GenTokFlag!]
* flag_ne: GenTokFlag


## Malicious tokens are not hidden by the `generativeToken{}` endpoint anymore

The `generativeToken{}` endpoint used to only return Generative Tokens which flag was `CLEAN` or `NONE`. This is not the case anymore, as the endpoint became the generic-purpose one instead. If you want to filter those tokens, you need to run:

```gql
query GenerativeTokens($filters: GenerativeTokenFilter) {
  generativeTokens(filters: $filters) {
    id
    name
    createdAt
    flag
  }
}
```

Variables:

```json
{
  "filters": {
    "flag_in": ["NONE", "CLEAN"]
  }
}
```