import type { Robot, RobotStatus } from './types';

interface RobotTableProps {
    robots: Robot[];
}

// Helper function to map statuses to our CSS classes
function getStatusClassName(status: RobotStatus): string {
    switch (status) {
        case "idle":
            return "status-badge status-idle";
        case "assigned":
            return "status-badge status-assigned";
        case "en_route":
            return "status-badge status-en-route";
        case "delivering":
            return "status-badge status-delivering";
        case "completed":
            return "status-badge status-completed";
        default:
            return "status-badge";
    }
}

export function RobotTable({ robots }: RobotTableProps) {
    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Robot ID</th>
                        <th>Status</th>
                        <th>Current Mission ID</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {robots.map((robot) => (
                        <tr key={robot.id}>
                            <td>{robot.id}</td>
                            <td>
                                {/* Apply the dynamic CSS class here */}
                                <span className={getStatusClassName(robot.status)}>
                                    {robot.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </td>
                            <td>{robot.currentMissionId || '-'}</td>
                            <td>
                                <button
                                    disabled={robot.status === 'idle'}
                                    onClick={() => alert(`Cancel functionality for ${robot.id} coming in Phase 7!`)}
                                >
                                    Cancel
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}