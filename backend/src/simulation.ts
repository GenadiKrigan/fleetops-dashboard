import { fleetService } from "./fleetService";

export function startSimulation() {
    console.log("FleetOps simulation started. Waiting 60 seconds for first mission.");
    setInterval(() => {
        console.log("--Generating 2 new missions--");
        for (let i = 1; i <= 2; i++) {
            const newMission = fleetService.createMission();
            fleetService.handleNewMission(newMission);
        }
        console.log(`Avaliable idle robots: ${fleetService.idleRobotIds.size}`);
        console.log(`Queued missions waiting: ${fleetService.missionQueue.length}`);

    }, 5000);
}