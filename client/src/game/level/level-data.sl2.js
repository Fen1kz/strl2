export default {
// @formatter:off
/*
00000000001111111
  01234567890123456789012345678901
*/map: `
 0################################
 1#@    #                        #
 2#  #  #                        #
 3#     #                        #
 4#][#+##                        #
 5#     #                        #
 6#     #                        #
 7#######                        #
 8#                              #
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
    {
      xy: [1,4]
      , traits: {
        'AutoDoor': {
          periodOpen: 1
          , periodTransition: 2
          , periodClosed: 1
          , state: 0
        }
      }
    }
    , {
      xy: [2,4]
      , traits: {
        'AutoDoor': {
          periodOpen: 1
          , periodTransition: 2
          , periodClosed: 1
          , state: 0
        }
      }
    }
  ]
}