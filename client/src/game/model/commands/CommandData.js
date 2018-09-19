import CommandId from "./CommandId";
import CommandDataModel from "../CommandDataModel";

export default {
  [CommandId.MOVE]: new CommandDataModel({
    id: CommandId.MOVE
    , getCommand: (sourceId, targetId, cost = 10) => ({
      type: CommandId.MOVE
      , cost: cost
      , sourceId
      , targetId
    })
    // , applyCost
  })
}