import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/ReservationStyles.css';

const ReservationComponent = () => {
    const [clientName, setClientName] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');
    const [departureTime, setDepartureTime] = useState('');
    const [numberOfPeople, setNumberOfPeople] = useState(1);
    const [tableNumber, setTableNumber] = useState('');
    const [message, setMessage] = useState('');
    const [reservations, setReservations] = useState([]);
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [editingReservation, setEditingReservation] = useState(null); // State to handle editing
    const [showReservations, setShowReservations] = useState(false); // State to toggle the visibility of the reservation table

    useEffect(() => {
        const meal = JSON.parse(localStorage.getItem('selectedMeal'));
        if (meal) {
            setSelectedMeal(meal);
        }
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            const response = await axios.get('http://localhost:8088/api/reservations');
            setReservations(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des réservations', error);
        }
    };

    const handleReservation = async (e) => {
        e.preventDefault();
        try {
            const formattedArrivalTime = new Date(arrivalTime).toISOString();
            const formattedDepartureTime = new Date(departureTime).toISOString();

            const response = await axios.post('http://localhost:8088/api/reservations', {
                clientName,
                arrivalTime: formattedArrivalTime,
                departureTime: formattedDepartureTime,
                numberOfPeople,
                tableNumber,
                mealName: selectedMeal.name,
            });

            if (response.status === 201) {
                setMessage('Réservation réussie !');
                fetchReservations();
                resetForm();
            } else {
                setMessage('Une erreur s\'est produite lors de la réservation.');
            }
        } catch (error) {
            handleError(error);
        }
    };

    const handleError = (error) => {
        if (error.response && error.response.data) {
            setMessage(`Erreur : ${error.response.data.message || 'Une erreur s\'est produite.'}`);
        } else {
            setMessage('Une erreur s\'est produite. Veuillez réessayer.');
        }
    };

    const resetForm = () => {
        setClientName('');
        setArrivalTime('');
        setDepartureTime('');
        setNumberOfPeople(1);
        setTableNumber('');
    };

    const handleEdit = (reservation) => {
        // When editing a reservation, pre-fill the form with the reservation's data
        setEditingReservation(reservation);
        setClientName(reservation.clientName);
        setArrivalTime(reservation.arrivalTime);
        setDepartureTime(reservation.departureTime);
        setNumberOfPeople(reservation.numberOfPeople);
        setTableNumber(reservation.tableNumber);
    };

    const handleUpdateReservation = async (e) => {
        e.preventDefault();
        try {
            const formattedArrivalTime = new Date(arrivalTime).toISOString();
            const formattedDepartureTime = new Date(departureTime).toISOString();

            const response = await axios.put(`http://localhost:8088/api/reservations/${editingReservation.id}`, {
                clientName,
                arrivalTime: formattedArrivalTime,
                departureTime: formattedDepartureTime,
                numberOfPeople,
                tableNumber,
                mealName: selectedMeal.name,
            });

            if (response.status === 200) {
                setMessage('Réservation mise à jour avec succès !');
                fetchReservations();
                setEditingReservation(null); // Reset the editing state
                resetForm();
            } else {
                setMessage('Une erreur s\'est produite lors de la mise à jour.');
            }
        } catch (error) {
            handleError(error);
        }
    };

    const handleDeleteReservation = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:8088/api/reservations/${id}`);
            if (response.status === 204) {
                setMessage('Réservation supprimée avec succès !');
                fetchReservations();
            } else {
                setMessage('Une erreur s\'est produite lors de la suppression.');
            }
        } catch (error) {
            handleError(error);
        }
    };

    const toggleReservations = () => {
        setShowReservations(!showReservations);
    };

    return (
        <div className="reservation-container">
            <h2>Faites votre réservation</h2>
            {selectedMeal && (
                <div>
                    <h3>Plat sélectionné: {selectedMeal.name}</h3>
                </div>
            )}
            <form onSubmit={editingReservation ? handleUpdateReservation : handleReservation}>
                <label>
                    Nom du client:
                    <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
                </label>
                <label>
                    Heure d'arrivée:
                    <input type="datetime-local" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} required />
                </label>
                <label>
                    Heure de départ:
                    <input type="datetime-local" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} required />
                </label>
                <label>
                    Nombre de personnes:
                    <input type="number" value={numberOfPeople} onChange={(e) => setNumberOfPeople(e.target.value)} min="1" required />
                </label>
                <label>
                    Numéro de table (facultatif):
                    <input type="number" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} />
                </label>
                <button type="submit">{editingReservation ? 'Mettre à jour' : 'Réserver'}</button>
            </form>

            {message && <p className="message">{message}</p>}

            <button onClick={toggleReservations} className="toggle-button">
                {showReservations ? 'Cacher les réservations' : 'Afficher les réservations'}
            </button>

            {showReservations && reservations.length > 0 && (
                <div>
                    <h3>Toutes les réservations</h3>
                    <table className="reservations-table">
                        <thead>
                        <tr>
                            <th>Nom du client</th>
                            <th>Plat réservé</th>
                            <th>Heure d'arrivée</th>
                            <th>Heure de départ</th>
                            <th>Nombre de personnes</th>
                            <th>Numéro de table</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reservations.map((reservation) => (
                            <tr key={reservation.id}>
                                <td>{reservation.clientName}</td>
                                <td>{reservation.mealName}</td>
                                <td>{new Date(reservation.arrivalTime).toLocaleString()}</td>
                                <td>{new Date(reservation.departureTime).toLocaleString()}</td>
                                <td>{reservation.numberOfPeople}</td>
                                <td>{reservation.tableNumber || 'N/A'}</td>
                                <td>
                                    <button onClick={() => handleEdit(reservation)}>Modifier</button>
                                    <button onClick={() => handleDeleteReservation(reservation.id)}>Supprimer</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showReservations && reservations.length === 0 && (
                <p>Aucune réservation trouvée.</p>
            )}
        </div>
    );
};

export default ReservationComponent;
