import TraitId from "../model/traits/TraitId";
import CommandId from '../model/commands/CommandId';

export default {
// @formatter:off
  /*
  00000000001111111
    01234567890123456789012345678901
  */map: `
 0################################
 1#       t #                    #
 2# #   O&  #                    #
 3#    OO   #                    #
 4#O   @                         #
 5#][#+#&#&#                     #
 6#        #                     #
 7# z      #                     #
 8##########                     #
 9#                              #
10#                              #
11#                              #
12#                              #
13#                              #
14#                              #
15#                              #
16#                              #
17#                              #
18#                              #
19#                              #
20#                              #
21#                              #
22#                              #
23#                              #
24#                              #
25#                              #
26#                              #
27#                              #
28#                              #
29#                              #
30#                              #
31################################

  `/*
0123456789012345678901234567890
@formatter:on
*/
  , entites: [
    {xy: [1, 5], traits: {'AutoDoor': {orientation: 0}}}
    , {xy: [2, 5], traits: {'AutoDoor': {orientation: 1}}}
    , {
      xy: [5, 5]
      , traits: {
        [TraitId.GfxText]: '/'
        , [TraitId.Interactive]: CommandId.SIGNAL_EMIT
        , [TraitId.Wire]: {
          targets: ['id0-door']
        }
      }
    }, {
      xy: [6, 5]
      , id: 'id0-door'
      , traits: {
        [TraitId.Door]: true
        , [TraitId.Wire]: {
          onSignal: CommandId.SWITCH
        }
      }
    }
  ]
}