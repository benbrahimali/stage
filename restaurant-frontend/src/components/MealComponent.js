import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ✅ Importé correctement
import './MealComponent.css';

const MealComponent = () => {
    const [meals, setMeals] = useState([]); // Liste des plats
    const [newMeal, setNewMeal] = useState({ name: '', description: '', price: '', imageUrl: '' }); // Formulaire d'ajout ou de mise à jour de plat
    const [isEditing, setIsEditing] = useState(false); // Pour savoir si on est en mode édition
    const [editMealId, setEditMealId] = useState(null); // ID du plat à mettre à jour
    const [message, setMessage] = useState(''); // Message de succès ou d'échec
    const navigate = useNavigate();

    // 🟢 Charger les plats depuis l'API au démarrage
    useEffect(() => {
        fetchMeals();
    }, []);

    const fetchMeals = async () => {
        try {
            const response = await axios.get('http://localhost:8096/api/menu-items');
            setMeals(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des plats', error);
        }
    };

    // 🟢 Gérer la commande d'un plat
    const handleOrder = (meal) => {
        localStorage.setItem('selectedMeal', JSON.stringify(meal));
        navigate('/reservations'); // Rediriger vers la page de réservation
    };

    // 🟢 Gérer la suppression d'un plat
    const handleDeleteMeal = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:8096/api/menu-items/${id}`);
            if (response.status === 204) {
                alert('Plat supprimé avec succès!');
                fetchMeals(); // Rafraîchir la liste des plats
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du plat', error);
        }
    };

    // 🟢 Gérer la mise à jour d'un plat (afficher le formulaire de mise à jour)
    const handleUpdateMeal = (meal) => {
        setNewMeal({ name: meal.name, description: meal.description, price: meal.price, imageUrl: meal.imageUrl });
        setIsEditing(true);
        setEditMealId(meal.id);
    };

    // 🟢 Gérer l'ajout d'un nouveau plat ou la mise à jour d'un plat existant
    const handleSubmitMeal = async (e) => {
        e.preventDefault();
        if (isEditing) {
            // Mode édition
            try {
                const response = await axios.put(`http://localhost:8096/api/menu-items/${editMealId}`, newMeal);
                if (response.status === 200) {
                    setMessage('Plat mis à jour avec succès!');
                    setNewMeal({ name: '', description: '', price: '', imageUrl: '' });
                    setIsEditing(false);
                    setEditMealId(null);
                    fetchMeals(); // Rafraîchir la liste des plats
                } else {
                    setMessage('Échec de la mise à jour du plat.');
                }
            } catch (error) {
                console.error('Erreur lors de la mise à jour du plat', error);
            }
        } else {
            // Mode ajout
            try {
                const response = await axios.post('http://localhost:8096/api/menu-items', newMeal);
                if (response.status === 201) {
                    setMessage('Plat ajouté avec succès!');
                    setNewMeal({ name: '', description: '', price: '', imageUrl: '' });
                    fetchMeals(); // Rafraîchir la liste des plats
                } else {
                    setMessage('Échec de l\'ajout du plat.');
                }
            } catch (error) {
                console.error('Erreur lors de l\'ajout du plat', error);
            }
        }
    };

    // 🟢 Annuler la mise à jour et revenir au formulaire d'ajout
    const handleCancelUpdate = () => {
        setIsEditing(false);
        setNewMeal({ name: '', description: '', price: '', imageUrl: '' });
        setEditMealId(null);
    };

    return (
        <div className="meal-page">
            {/* Formulaire d'ajout ou de mise à jour d'un plat */}
            <div className="add-meal-form">
                <h2>{isEditing ? 'Modifier le plat' : 'Ajouter un nouveau plat'}</h2>
                <form onSubmit={handleSubmitMeal}>
                    <input
                        type="text"
                        placeholder="Nom du plat"
                        value={newMeal.name}
                        onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                        required
                    />
                    <textarea
                        placeholder="Description du plat"
                        value={newMeal.description}
                        onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Prix du plat"
                        value={newMeal.price}
                        onChange={(e) => setNewMeal({ ...newMeal, price: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="URL de l'image"
                        value={newMeal.imageUrl}
                        onChange={(e) => setNewMeal({ ...newMeal, imageUrl: e.target.value })}
                    />
                    <button type="submit">{isEditing ? 'Mettre à jour' : 'Ajouter'}</button>
                    {isEditing && (
                        <button type="button" onClick={handleCancelUpdate} className="cancel-btn">
                            Annuler
                        </button>
                    )}
                </form>
                {message && <p className="message">{message}</p>}
            </div>

            <div className="meal-header">
                <h1 className="meal-title">Notre Menu</h1>
                <p className="meal-subtitle">Découvrez nos plats délicieux et fraîchement préparés.</p>
            </div>

            <div className="meal-list">
                {meals.map(meal => (
                    <div key={meal.id} className="meal-item">
                        <img src={meal.imageUrl || 'src/assets/the.jpeg'} alt={meal.name} className="meal-image" />
                        <div className="meal-details">
                            <h3 className="meal-name">{meal.name}</h3>
                            <p className="meal-description">{meal.description}</p>
                            <p className="meal-price">{meal.price} TND</p>
                            <button className="order-btn" onClick={() => handleOrder(meal)}>Commander</button>
                            <button className="update-btn" onClick={() => handleUpdateMeal(meal)}>Modifier</button>
                            <button className="delete-btn" onClick={() => handleDeleteMeal(meal.id)}>Supprimer</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MealComponent;
