//Helper function imports
const getTeam = require("../../../../team/getTeam/getTeam");
const getUser = require("../../../profile/getUser/getUser");
const Team = require("../../../../../models/Team/Team");
const getEvent = require("../../../../event/getEvent/getEvent");
const acceptInvite = async (req, res) => {
  const teamId = req.params.teamId;
  //to check if user exists
  const inviteeQuery = await getUser(req.userId, "byId");
  //to check if team exists
  const teamQuery = await getTeam(teamId, "byId");
  // to get the status code of the query output
  const teamStatus = teamQuery.status;
  if (teamStatus == 200) {
    const team = teamQuery.payload;
    //check whether the user has invite for team
    if (team.pendingRequests.includes(req.userId)) {
      //generate users data
      if (inviteeQuery.status == 200) {
        const invitee = inviteeQuery.payload;
        // NOTE: theoretically this check should always pass as team.pendingRequests and user.teamInvites
        // are meant to always be manipulated together in each route that deals with teamInvites
        // so if team.pendingRequests.include(inviteeId) is true then then invitee.teamInvites.includes(team._id)
        // should also be true
        //check whether users teamInvites include team id
        if (invitee.teamInvites.includes(teamId)) {
          //also check user isn't already member of another team for same event
          const otherTeam = await Team.findOne({
            eventId: team.eventId,
            members: req.userId,
          });

          if (!otherTeam) {
            //true if other team is not found

            //check that team is not full already
            const eventQuery = await getEvent(team.eventId, "byId");
            const event = eventQuery.payload;
            const maximumTeamSize = event.maximumTeamSize;
            //now let us modify the team schema by adding the userId to the members and removing the userId from the pendingRequests
            if (team.members.length >= maximumTeamSize) {
              return res.status(400).send({
                message: "team is already full",
              });
            } else {
              team.members.addToSet(invitee._id);

              const pendingRequests = team.pendingRequests;
              pendingRequests.splice(pendingRequests.indexOf(invitee._id), 1);
              team.pendingRequests = pendingRequests;

              //let us also modify the user schema by adding the the teamsId to the teams and remove the teamsId from the teamInvites
              invitee.teams.addToSet(team._id);

              const teamInvites = invitee.teamInvites;
              teamInvites.splice(teamInvites.indexOf(team._id), 1);
              invitee.teamInvites = teamInvites;

              //save the updated team and user profiles
              const updatedTeam = await team.save();
              const updatedInvitee = await invitee.save();

              //return the updated Invitee profile
              return res.status(201).send({
                message: "Invite accepted successfully",
              });
            }
          } else {
            return res.status(400).send({
              message:
                "You're already a member for another team for the same event, You can't accept this invite until you leave the other team!",
            });
          }
        } else {
          return res.status(400).send({
            message: "No Invite found for that team",
          });
        }
      } else {
        return res.status(inviteeQuery.status).send(inviteeQuery.payload);
      }
    } else {
      return res.status(400).send({
        message: "Invitee doesnt have any pending requests from this team",
      });
    }
  } else {
    return res.status(teamStatus).send(teamQuery.payload);
  }
};

module.exports = acceptInvite;
