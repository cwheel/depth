const getAmbientPresure = (depth, salinity) => {
    // One atmosphere (atm) of pressure is equivilent to 33 feet in saltwater and
    // 34 feet in freshwater
    const waterConst = salinity ? 33 : 34;

    // Atmospheres of water pressure plus the earths atmosphere
    return depth / waterConst + 1;
};

const planCCR = ({ exitRate, totalGas, sacExit, depth, salinity }) => {
    // Observing the rule of thirds, we always have twice the gas needed to exit
    const maxGas = totalGas * 0.5;

    // Adjust SAC for depth to get respitory-minute-volume
    const rmv = sacExit * getAmbientPresure(depth, salinity);

    // Given the maximum usable gas and the amount of gas being used each minute (RMV)
    // extrapolate the number of minutes we can spend exiting the environment
    const maxTime = maxGas / rmv;

    // Given the speed we exit at, and the number of minutes we can spend exiting,
    // extraploate the maximum distance we can cover on our exit
    return exitRate * maxTime;
};

const planOC = ({ sacPenetration, sacExit, totalGas, penetrationRate, exitRate, depth, salinity }) => {
    const ambientPressure = getAmbientPresure(depth, salinity);

    // Adjust penetration SAC for depth to get respitory-minute-volume
    const penetrationRmv = sacPenetration * ambientPressure;

    // Adjust exit SAC for depth to get respitory-minute-volume
    const exitRmv = sacExit * ambientPressure;

    // The following formula isn't easily broken apart, the derivation is as follows:
    // First, establish the following variables:
    //
    // G(t) = total gas
    // G(p) = penetration gas
    // D = penetration distance
    // S(e) = exit SAC rate
    // S(p) = penetration SAC rate
    // P = ambient pressure
    // R(p) = penetration rate
    // R(e) = exit rate
    //
    // Thus, the following expression can be constructed by observing the rule of thirds:
    //
    // exit gas = (S(e) * P * (D / R(e)))
    // exit gas observing rule of thirds = 2(S(e) * P * (D / R(e)))
    // Thus, G(t) = G(p) + 2(S(e) * P * (D / R(e)))
    // G(p) can be expressed similarly, but derived from S(p) and R(p)
    // G(p) = (S(p) * P * (D / R(p)))
    // Some basic rearangement gets us:
    // G(p) = G(t) - 2(S(e) * P * (D / R(e)))
    // Substitution:
    // (S(p) * P * (D / R(p))) = G(t) - 2(S(e) * P * (D / R(e)))
    // Seperation:
    // (S(p) * P * D * (1 / R(p))) = G(t) - 2(S(e) * P * D ( 1 / R(e)))
    // Divide by D:
    // (S(p) * P * (1 / R(p))) = (G(t) / D) - 2(S(e) * P ( 1 / R(e)))
    // Rearange again:
    // (S(p) * P * (1 / R(p))) + 2(S(e) * P ( 1 / R(e))) = (G(t) / D)
    // Remove G(t) term:
    // G(t) * ((S(p) * P * (1 / R(p))) + 2(S(e) * P ( 1 / R(e)))) ^ -1 = D

    return totalGas * Math.pow(((penetrationRmv / penetrationRate) + ((2 * exitRmv) / exitRate)), -1);
};

const planDrops = (tanks, totalGas, maxDistance, mode) => {
    // How much of the total gas supply is used per foot? We plan on using no more
    // than half of the gas supply to exit.
    const gasPerFoot = (totalGas / 2) / maxDistance;

    // Someone is planning on using more than one set of doubles, nonsensical
    if (tanks.filter(tank => tank.doubles).length > 2) {
        return null;
    }

    const drops = [];

    let currentDistance = maxDistance;
    const tanksUsageOrdered = mode === 'ccr' ? tanks.reverse() : tanks;

    for (let tank of tanksUsageOrdered) {
        const exitProgress = (tank.fill / 2) / gasPerFoot;
        currentDistance = currentDistance - exitProgress
        drops.push(currentDistance);
    }

    return drops;
};

export { planCCR, planOC, planDrops };