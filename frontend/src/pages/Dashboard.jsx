import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

export default function Dashboard() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get("/events");
            setEvents(response.data.events || []);
        } catch (error) {
            console.error("Gagal ambil event", error);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Daftar Event (Public)</h1>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {events.map((ev) => (
                    <div key={ev.id} style={{ border: "1px solid #ccc", padding: "10px", width: "200px" }}>
                        <h3>{ev.title}</h3>
                        <p>Kategori: {ev.category}</p>
                        <p>Oleh: {ev.organization_name}</p>
                        <Link to={`/event/${ev.id}`}>
                            <button>Lihat Detail</button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}