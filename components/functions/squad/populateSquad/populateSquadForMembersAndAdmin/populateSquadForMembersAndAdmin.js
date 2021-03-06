const getUser = require("../../../user/profile/getUser/getUser")
const getShareableUserDocs = require("../../../user/getShareableUserDocs/getShareableUserDocs")

const populateSquadForMembersAndAdmin = async (squadData) => {
    const squad = {
        ...squadData
    }

    //this will only get triggered for admin and all other members
    const memberDocs = await Promise.all(
        squad.members.map(async (member) => {
            const memberDocQuery = await getUser(member, "byId")
            return memberDocQuery.payload.toJSON() //payload contains the actual user objects
            //we do .JSON() to remove other mongoose methods
        })
    )

    squad.membersInfo = getShareableUserDocs(memberDocs)


    //this will only get triggered for admin only
    if (squad.pendingRequests) {
        const inviteeDocs = []
        for (const invitee of squad.pendingRequests) {
            const inviteeDocQuery = await getUser(invitee, "byId")
            inviteeDocs.push(inviteeDocQuery.payload.toJSON()) //payload contains the actual user objects
            //we do .JSON() to remove other mongoose methods
        }
        squad.pendingRequestsInfo = getShareableUserDocs(inviteeDocs)
    }

    return squad
}

module.exports = populateSquadForMembersAndAdmin