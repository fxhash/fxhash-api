import { Objkt } from "../Entity/Objkt"

/**
 * A method that updates the rarity of each feature of a Gentk, and of all the Gentks coming from the
 * same Generative Token
 */
export async function updateGentkRarity(gentk: Objkt) {
  // at first, we only update the features if the Gentk actually has some features
  if (gentk.features && gentk.issuer) {
    // find all the Gentk from the same collection
    const collec = await Objkt.find({
      where: {
        issuer: gentk.issuer.id
      }
    })

    // go through each feature of the new Gentk
    for (const feature of gentk.features) {
      // we compute the rarity of the feature for each each Gentk
      const allValues = collec
        .map(tok => tok.features?.find(feat => feat.name === feature.name))
        .filter(feat => !!feat)
      
      // compute occurences
      const occurences = allValues.reduce((prev, curr) => {
        const prop = (curr!.value).toString()
        prev[prop] = prev[prop] ? prev[prop]+1 : 1
        return prev
      }, {})

      // assign the rarity of the feature for each Token
      for (const tok of collec) {
        const tokFeature = tok.features && tok.features.find(feat => feat.name === feature.name)
        if (tokFeature) {
          tokFeature.rarity = occurences[tokFeature.value.toString()] / allValues.length
        }
      }
    }

    // finally compute each token overall rarity (average of rarities)
    for (const tok of collec) {
      if (tok.features && tok.features.length > 0) {
        let [rarity, nb] = tok.features.reduce((prev, curr) => curr.rarity ? [prev[0]+curr.rarity, prev[1]+1] : prev, [0, 0])
        if (nb > 0) {
          tok.rarity = rarity / nb
        }
      }
    }

    // save all the tokens to the DB
    await Objkt.save(collec)
  }
}