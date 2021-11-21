import { createGenTokActionsLoader, createGenTokLatestActionsLoader, createGenTokLatestObjktsLoader, createGenTokLoader, createGenTokObjktsLoader, createGenTokReportsLoader } from '../DataLoaders/GenTokens'
import { createObjktActionsLoader, createObjktsLoader } from '../DataLoaders/Objkt'
import { createOffersLoader } from '../DataLoaders/Offer'
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

    // OFFERS loaders
    offersLoader: createOffersLoader(),

    // OBJKTS loaders
		objktsLoader: createObjktsLoader(),
    objktActionsLoader: createObjktActionsLoader(),

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