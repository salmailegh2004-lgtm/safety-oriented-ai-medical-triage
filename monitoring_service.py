import json
from datetime import datetime
from pathlib import Path
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)

class MonitoringService:
    """
    Monitoring service for logging and analyzing system performance
    Tracks latency, errors, and usage patterns
    """
    
    def __init__(self):
        self.metrics_file = Path("data/metrics.json")
        self.metrics = self._load_metrics()
    
    def _load_metrics(self):
        """Load existing metrics from file"""
        if self.metrics_file.exists():
            try:
                with open(self.metrics_file, 'r') as f:
                    return json.load(f)
            except:
                pass
        
        return {
            "requests": [],
            "errors": [],
            "urgency_distribution": defaultdict(int),
            "total_requests": 0,
            "average_latency": 0,
            "start_time": datetime.now().isoformat()
        }
    
    def _save_metrics(self):
        """Save metrics to file"""
        try:
            self.metrics_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.metrics_file, 'w') as f:
                json.dump(self.metrics, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Failed to save metrics: {e}")
    
    def log_request(self, endpoint, latency, status, urgency_level=None):
        """
        Log an API request with performance metrics
        """
        request_log = {
            "endpoint": endpoint,
            "latency": latency,
            "status": status,
            "urgency_level": urgency_level,
            "timestamp": datetime.now().isoformat()
        }
        
        self.metrics["requests"].append(request_log)
        self.metrics["total_requests"] += 1
        
        # Update urgency distribution
        if urgency_level:
            if "urgency_distribution" not in self.metrics:
                self.metrics["urgency_distribution"] = {}
            if urgency_level not in self.metrics["urgency_distribution"]:
                self.metrics["urgency_distribution"][urgency_level] = 0
            self.metrics["urgency_distribution"][urgency_level] += 1
        
        # Update average latency
        latencies = [r["latency"] for r in self.metrics["requests"]]
        self.metrics["average_latency"] = sum(latencies) / len(latencies)
        
        # Log errors
        if status == "error":
            self.metrics["errors"].append(request_log)
        
        # Keep only last 1000 requests in memory
        if len(self.metrics["requests"]) > 1000:
            self.metrics["requests"] = self.metrics["requests"][-1000:]
        
        self._save_metrics()
        
        logger.info(f"Request logged: {endpoint} - {status} ({latency:.3f}s)")
    
    def get_metrics(self):
        """
        Get comprehensive system metrics
        """
        recent_requests = self.metrics["requests"][-100:]
        
        # Calculate statistics
        if recent_requests:
            recent_latencies = [r["latency"] for r in recent_requests]
            recent_errors = [r for r in recent_requests if r["status"] == "error"]
            
            stats = {
                "total_requests": self.metrics["total_requests"],
                "average_latency": round(self.metrics["average_latency"], 3),
                "recent_average_latency": round(sum(recent_latencies) / len(recent_latencies), 3),
                "error_rate": len(self.metrics["errors"]) / max(self.metrics["total_requests"], 1),
                "recent_error_rate": len(recent_errors) / max(len(recent_requests), 1),
                "urgency_distribution": dict(self.metrics.get("urgency_distribution", {})),
                "uptime_start": self.metrics["start_time"],
                "last_request": recent_requests[-1]["timestamp"] if recent_requests else None
            }
        else:
            stats = {
                "total_requests": 0,
                "average_latency": 0,
                "recent_average_latency": 0,
                "error_rate": 0,
                "recent_error_rate": 0,
                "urgency_distribution": {},
                "uptime_start": self.metrics["start_time"],
                "last_request": None
            }
        
        return stats
    
    def get_performance_report(self):
        """
        Generate a detailed performance report
        """
        metrics = self.get_metrics()
        
        report = f"""
        === TRIAGE SYSTEM PERFORMANCE REPORT ===
        
        Total Requests: {metrics['total_requests']}
        Average Latency: {metrics['average_latency']}s
        Error Rate: {metrics['error_rate']:.2%}
        
        Urgency Distribution:
        """
        
        for level, count in metrics['urgency_distribution'].items():
            percentage = (count / metrics['total_requests']) * 100 if metrics['total_requests'] > 0 else 0
            report += f"\n  - {level}: {count} ({percentage:.1f}%)"
        
        return report