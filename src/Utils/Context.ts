import { createGenTokActionsLoader, createGenTokLatestActionsLoader, createGenTokLatestObjktsLoader, createGenTokLoader, createGenTokMarketStatsLoader, createGenTokObjktsCountLoader, createGenTokObjktsLoader, createGenTokReportsLoader } from '../DataLoaders/GenTokens'
import { createObjktActionsLoader, createObjktGenerativesLoader, createObjktOffersLoader, createObjktOwnersLoader, createObjktsLoader } from '../DataLoaders/Objkt'
import { createOfferIssuersLoader, createOfferObjktsLoader, createOffersLoader } from '../DataLoaders/Offer'
import { createUsersGenTokLoader, createUsersIssuerActionssLoader, createUsersLoader, createUsersObjktLoader, 
  createUsersOffersLoader, createUsersTargetActionssLoader } from '../DataLoaders/User'
import { RequestContext } from '../types/RequestContext'

export const createContext = (req: any, res: any): RequestContext => {
	// @ts-ignore
	return ({
		req,

		// usersLiveSessionsLoader: createUsersLiveSessionsLoader(),
		// themesLiveSessionsLoader: createThemesLiveSessionsLoader(),
		// usersLoader: createUsersLoader(),

		// USER loaders
    usersLoader: createUsersLoader(),
		userObjktsLoader: createUsersObjktLoader(),
		userGenToksLoader: createUsersGenTokLoader(),
    userOffersLoader: createUsersOffersLoader(),
    userIssuerActionsLoader: createUsersIssuerActionssLoader(),
	  userTargetActionsLoader: createUsersTargetActionssLoader(),

    // GENERATIVE TOKEN loaders
    genTokLoader: createGenTokLoader(),
    genTokObjktsLoader: createGenTokObjktsLoader(),
		genTokLatestObjktsLoader: createGenTokLatestObjktsLoader(),
    genTokActionsLoader: createGenTokActionsLoader(),
		genTokLatestActionsLoader: createGenTokLatestActionsLoader(),
		genTokReportsLoader: createGenTokReportsLoader(),
		genTokMarketStatsLoader: createGenTokMarketStatsLoader(),
		genTokObjktsCountLoader: createGenTokObjktsCountLoader(),

    // OFFERS loaders
    offersLoader: createOffersLoader(),
		offerObjktsLoader: createOfferObjktsLoader(),
		offerIssuersLoader: createOfferIssuersLoader(),

    // OBJKTS loaders
		objktsLoader: createObjktsLoader(),
    objktActionsLoader: createObjktActionsLoader(),
    objktOwnersLoader: createObjktOwnersLoader(),
    objktOffersLoader: createObjktOffersLoader(),
    objktGenerativesLoader: createObjktGenerativesLoader(),

		// // live session loaders
		// liveSessionsLoader: createLiveSessionsLoader(),
		// liveSessionsRoomsLoader: createLiveSessionsRoomsLoader(),
		// liveSessionsRatingsLoader: createLiveSessionsRatingsLoader(),

		// // room loaders
		// roomsLiveSessionsLoader: createRoomsLiveSessionsLoader(),
		// roomsRatingsLoader: createRoomsRatingsLoader(), 
		// roomMessagesLoader: createRoomMessagesLoader(),

		// // rating loaders 
		// ratingsUsersLoader: createRatingsAuthorsLoader(),
		// ratingsRoomsLoader: createRatingsRoomsLoader(),
		// ratingsLiveSessionsLoader: createRatingsLiveSessionsLoader(),

		// // room message loaders
		// roomMessagesUsersLoader: createRoomMessagesUsersLoader(),
	})
}