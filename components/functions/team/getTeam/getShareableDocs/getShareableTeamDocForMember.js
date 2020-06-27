const getShareableTeamDocForMember = doc => {
    const {
        _id,
        creatorId,
        members,
        teamName,
        eventId,
        description,
        skillsRequired,
        nameOfEvent
    } = doc

    return {
        _id,
        creatorId,
        teamName,
        eventId,
        description,
        skillsRequired,
        members,
        nameOfEvent
    }
}

module.exports = getShareableTeamDocForMember