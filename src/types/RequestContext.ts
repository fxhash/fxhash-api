import { Request as ExpressRequest } from "express"
import { createGenTokActionsLoader, createGenTokLatestActionsLoader, createGenTokLatestObjktsLoader, createGenTokLoader, createGenTokMarketStatsLoader, createGenTokObjktsCountLoader, createGenTokObjktsLoader, createGenTokReportsLoader } from "../DataLoaders/GenTokens"
import { createObjktActionsLoader, createObjktsLoader } from "../DataLoaders/Objkt"
import { createOffersLoader } from "../DataLoaders/Offer"
import { createUsersObjktLoader, createUsersGenTokLoader, createUsersOffersLoader, createUsersIssuerActionssLoader, 
  createUsersTargetActionssLoader, createUsersLoader } from "../DataLoaders/User"



export interface RequestContext extends ExpressRequest {
  req: any,

	// user loaders
	// usersLoader: ReturnType<typeof createUsersLoader>,
  // usersLiveSessionsLoader: ReturnType<typeof createUsersLiveSessionsLoader>,
  
	// // theme loaders
	// themesLiveSessionsLoader: ReturnType<typeof createThemesLiveSessionsLoader>,

	// USER loaders
	usersLoader: ReturnType<typeof createUsersLoader>,
	userObjktsLoader: ReturnType<typeof createUsersObjktLoader>,
	userGenToksLoader: ReturnType<typeof createUsersGenTokLoader>,
	userOffersLoader: ReturnType<typeof createUsersOffersLoader>,
	userIssuerActionsLoader: ReturnType<typeof createUsersIssuerActionssLoader>,
	userTargetActionsLoader: ReturnType<typeof createUsersTargetActionssLoader>,

  // GENERATIVE TOKEN loaders
  genTokLoader: ReturnType<typeof createGenTokLoader>,
  genTokObjktsLoader: ReturnType<typeof createGenTokObjktsLoader>,
  genTokLatestObjktsLoader: ReturnType<typeof createGenTokLatestObjktsLoader>,
  genTokActionsLoader: ReturnType<typeof createGenTokActionsLoader>,
  genTokLatestActionsLoader: ReturnType<typeof createGenTokLatestActionsLoader>,
  genTokReportsLoader: ReturnType<typeof createGenTokReportsLoader>,
  genTokMarketStatsLoader: ReturnType<typeof createGenTokMarketStatsLoader>,
  genTokObjktsCountLoader: ReturnType<typeof createGenTokObjktsCountLoader>,

  // OFFERS loaders
  offersLoader: ReturnType<typeof createOffersLoader>,

  // OBJKTS loaders
  objktsLoader: ReturnType<typeof createObjktsLoader>,
  objktActionsLoader: ReturnType<typeof createObjktActionsLoader>,

	// // room loaders
	// roomsLiveSessionsLoader: ReturnType<typeof createRoomsLiveSessionsLoader>,
	// roomsRatingsLoader: ReturnType<typeof createRoomsRatingsLoader>,
	// roomMessagesLoader: ReturnType<typeof createRoomMessagesLoader>,

	// // live session loaders
	// liveSessionsLoader: ReturnType<typeof createLiveSessionsLoader>,
	// liveSessionsRoomsLoader: ReturnType<typeof createLiveSessionsRoomsLoader>,
	// liveSessionsRatingsLoader: ReturnType<typeof createLiveSessionsRatingsLoader>,

	// // rating loaders
	// ratingsUsersLoader: ReturnType<typeof createRatingsAuthorsLoader>,
	// ratingsRoomsLoader: ReturnType<typeof createRatingsRoomsLoader>,
	// ratingsLiveSessionsLoader: ReturnType<typeof createRatingsLiveSessionsLoader>,

	// // room message loaders
	// roomMessagesUsersLoader: ReturnType<typeof createRoomMessagesUsersLoader>,
}