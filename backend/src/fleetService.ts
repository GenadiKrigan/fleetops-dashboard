import { Robot, Mission, RobotStatus, MissionStatus } from './models';

class FleetService {
    public robots: Map<string, Robot> = new Map();
    public missions: Map<string, Mission> = new Map();
    public idleRobotIds: Set<string> = new Set();
    public missionQueue: Mission[] = [];

    private missionCounter: number = 0;
    public activeTimers: Map<string, NodeJS.Timeout> = new Map();

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
                this.assignMissionToRobot(robotId, mission);
            }
        } else {
            //No idle robots available, push to wait queue
            mission.status = "queued";
            this.missionQueue.push(mission);
        }
    }

    //Lifecycle logic
    private assignMissionToRobot(robotId: string, mission: Mission) {
        const robot = this.robots.get(robotId)!;
        robot.status = "assigned";
        robot.currentMissionId = mission.id;
        mission.status = "assigned";
        mission.robotId = robotId;
        console.log(`[Assign] Robot ${robotId} assigned to Mission ${mission.id}`);

        // Start the lifecycle: assigned lasts 10 seconds before moving to en_route
        this.scheduleNextState(robotId, mission.id, "en_route", 10000);
    }

    private scheduleNextState(robotId: string, missionId: string, nextState: RobotStatus | "finish", delayMs: number) {
        const timer = setTimeout(() => {
            this.transitionState(robotId, missionId, nextState);
        }, delayMs);

        this.activeTimers.set(robotId, timer);
    }

    private transitionState(robotId: string, missionId: string, nextState: RobotStatus | "finish") {
        const robot = this.robots.get(robotId);
        const mission = this.missions.get(missionId);

        if (!robot || !mission) return;
        if (mission.status === "cancelled") return; // Safety check

        if (nextState === "finish") {
            this.finishMission(robotId);
            return;
        }

        // Update status
        robot.status = nextState;
        mission.status = nextState as MissionStatus;

        console.log(`[Transition] Robot ${robotId} is now ${nextState}`);

        // Chain the next timers based on current new state
        if (nextState === "en_route") {
            this.scheduleNextState(robotId, missionId, "delivering", 20000);
        } else if (nextState === "delivering") {
            this.scheduleNextState(robotId, missionId, "completed", 15000);
        } else if (nextState === "completed") {
            this.scheduleNextState(robotId, missionId, "finish", 5000);
        }
    }

    private finishMission(robotId: string) {
        const robot = this.robots.get(robotId);
        if (!robot) return;

        console.log(`[Finish] Robot ${robotId} completed its mission.`);

        robot.currentMissionId = null;
        this.activeTimers.delete(robotId);

        // Check waiting queue
        if (this.missionQueue.length > 0) {
            const nextMission = this.missionQueue.shift()!;
            console.log(`[Queue] Robot ${robotId} immediately taking queued Mission ${nextMission.id}`);
            this.assignMissionToRobot(robotId, nextMission);
        } else {
            robot.status = "idle";
            this.idleRobotIds.add(robotId);
            console.log(`[Idle] Robot ${robotId} is back to idle.`);
        }
    }
}

export const fleetService = new FleetService();