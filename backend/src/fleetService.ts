import { Robot, Mission, RobotStatus, MissionStatus } from './models';

class FleetService {
    public robots: Map<string, Robot> = new Map();
    public missions: Map<string, Mission> = new Map();
    public idleRobotIds: Set<string> = new Set();
    public missionQueue: Mission[] = [];

    private missionCounter: number = 0;
    public activeTimer: Map<string, NodeJS.Timeout> = new Map();

    constructor() {
        this.initializeRobots();
    }

    //Generate all 100 robots and idle robot pool
    private initializeRobots() {
        for (let i = 1; i <= 100; i++) {
            const robotId = `R-${i.toString().padStart(3, '0')}`;
            const robot: Robot = {
                id: robotId,
                status: "idle",
                currentMissionId: null,
            };
            this.robots.set(robotId, robot);
            this.idleRobotIds.add(robotId);
        }
    }

    public getAllRobots(): Robot[] {
        return Array.from(this.robots.values());
    }

    //Generate a new mission and store it
    public createMission(): Mission {
        this.missionCounter++;
        const missionId = `M-${this.missionCounter.toString().padStart(3, '0')}`;
        const mission: Mission = {
            id: missionId,
            status: "queued",
            robotId: null,
        };
        this.missions.set(missionId, mission);
        return mission;
    }

    // Attempt to assign the mission or add it to the queue
    public handleNewMission(mission: Mission) {
        if (this.idleRobotIds.size > 0) {
            const robotId = this.idleRobotIds.values().next().value; //Get the first available idle robot
            if (robotId) {
                this.idleRobotIds.delete(robotId); //Remove from idle pool
                const robot = this.robots.get(robotId)!;
                //Update robot
                robot.status = "assigned";
                robot.currentMissionId = mission.id;
                //Update mission
                mission.status = "assigned";
                mission.robotId = robotId;
            }
        } else {
            //No idle robots available, push to wait queue
            mission.status = "queued";
            this.missionQueue.push(mission);
        }
    }
}
export const fleetService = new FleetService();