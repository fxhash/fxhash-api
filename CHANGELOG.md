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
    "name": "Ethereal Microcosm",
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