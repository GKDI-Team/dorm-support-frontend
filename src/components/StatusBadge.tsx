import type {IssueStatus} from '../api';
import {statusLabels} from '../lib/labels';

export default function StatusBadge({status}: { status: IssueStatus }) {
    return (
        <span className={`status-badge status-${status.toLowerCase()}`}>
            <i/>{statusLabels[status]}
        </span>
    );
}
