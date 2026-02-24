// ===== FIREBASE HELPERS =====

// User Management
async function getUserProfile(uid) {
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (doc.exists) {
      return doc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

async function updateUserProfile(uid, data) {
  try {
    await db.collection('users').doc(uid).update({
      ...data,
      lastUpdated: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}

async function createUserProfile(uid, email, username) {
  try {
    await db.collection('users').doc(uid).set({
      uid: uid,
      email: email,
      username: username,
      avatar: userProfile.avatar,
      favorites: [],
      watchedEpisodes: {},
      createdAt: new Date(),
      lastLogin: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return false;
  }
}

// Comments Management
async function addComment(animeId, userId, username, userAvatar, text) {
  try {
    const docRef = await db.collection('comments').add({
      animeId: animeId,
      userId: userId,
      username: username,
      userAvatar: userAvatar,
      text: text,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      replies: []
    });
    
    return {
      id: docRef.id,
      success: true
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { success: false, error };
  }
}

async function getComments(animeId, limit = 20) {
  try {
    const snapshot = await db.collection('comments')
      .where('animeId', '==', animeId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    const comments = [];
    snapshot.forEach(doc => {
      comments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return comments;
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
}

async function updateComment(commentId, text) {
  try {
    await db.collection('comments').doc(commentId).update({
      text: text,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating comment:', error);
    return false;
  }
}

async function deleteComment(commentId) {
  try {
    await db.collection('comments').doc(commentId).delete();
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
}

async function likeComment(commentId) {
  try {
    const doc = await db.collection('comments').doc(commentId).get();
    const currentLikes = doc.data()?.likes || 0;
    
    await db.collection('comments').doc(commentId).update({
      likes: currentLikes + 1
    });
    
    return true;
  } catch (error) {
    console.error('Error liking comment:', error);
    return false;
  }
}

// Avatar Upload to Storage
async function uploadUserAvatar(uid, file) {
  try {
    const storageRef = storage.ref(`avatars/${uid}`);
    const snapshot = await storageRef.put(file);
    const downloadUrl = await snapshot.ref.getDownloadURL();
    
    await db.collection('users').doc(uid).update({
      avatar: downloadUrl,
      lastUpdated: new Date()
    });
    
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return null;
  }
}

// Favorites
async function addToFavorites(uid, animeId, animeData) {
  try {
    await db.collection('users').doc(uid).update({
      favorites: firebase.firestore.FieldValue.arrayUnion({
        animeId: animeId,
        title: animeData.title,
        image: animeData.images?.jpg?.large_image_url,
        score: animeData.score,
        addedAt: new Date()
      })
    });
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
}

async function removeFromFavorites(uid, animeId) {
  try {
    const doc = await db.collection('users').doc(uid).get();
    const favorites = doc.data()?.favorites || [];
    const updated = favorites.filter(fav => fav.animeId !== animeId);
    
    await db.collection('users').doc(uid).update({
      favorites: updated
    });
    
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
}

async function getFavorites(uid) {
  try {
    const doc = await db.collection('users').doc(uid).get();
    return doc.data()?.favorites || [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
}

// Watched Episodes
async function markEpisodeWatched(uid, animeId, episodeId, episodeData) {
  try {
    const userRef = db.collection('users').doc(uid);
    await userRef.update({
      [`watchedEpisodes.${episodeId}`]: {
        animeId: animeId,
        episodeId: episodeId,
        title: episodeData?.title,
        watchedAt: new Date()
      }
    });
    return true;
  } catch (error) {
    console.error('Error marking episode watched:', error);
    return false;
  }
}

async function getWatchedEpisodes(uid, animeId) {
  try {
    const doc = await db.collection('users').doc(uid).get();
    const watched = doc.data()?.watchedEpisodes || {};
    
    return Object.values(watched).filter(ep => ep.animeId === animeId);
  } catch (error) {
    console.error('Error getting watched episodes:', error);
    return [];
  }
}

// Watchlist
async function addToWatchlist(uid, animeId, animeData) {
  try {
    await db.collection('watchlists').doc(`${uid}_${animeId}`).set({
      uid: uid,
      animeId: animeId,
      title: animeData.title,
      image: animeData.images?.jpg?.large_image_url,
      score: animeData.score,
      status: 'watching', // watching, completed, dropped, planning
      progress: 0,
      addedAt: new Date(),
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return false;
  }
}

async function updateWatchlistProgress(uid, animeId, progress) {
  try {
    await db.collection('watchlists').doc(`${uid}_${animeId}`).update({
      progress: progress,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating watchlist progress:', error);
    return false;
  }
}

async function getWatchlist(uid) {
  try {
    const snapshot = await db.collection('watchlists')
      .where('uid', '==', uid)
      .orderBy('updatedAt', 'desc')
      .get();
    
    const watchlist = [];
    snapshot.forEach(doc => {
      watchlist.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return watchlist;
  } catch (error) {
    console.error('Error getting watchlist:', error);
    return [];
  }
}

// Recommendations/History
async function addToSearchHistory(uid, query) {
  try {
    await db.collection('searchHistory').doc(`${uid}_${Date.now()}`).set({
      uid: uid,
      query: query,
      searchedAt: new Date()
    });
  } catch (error) {
    console.error('Error adding to search history:', error);
  }
}

async function getSearchHistory(uid, limit = 10) {
  try {
    const snapshot = await db.collection('searchHistory')
      .where('uid', '==', uid)
      .orderBy('searchedAt', 'desc')
      .limit(limit)
      .get();
    
    const history = [];
    snapshot.forEach(doc => {
      history.push(doc.data().query);
    });
    
    return [...new Set(history)]; // Remove duplicates
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
}

// Analytics/Engagement
async function logPageView(page) {
  if (!currentUser) return;
  
  try {
    await db.collection('analytics').add({
      uid: currentUser.uid,
      page: page,
      timestamp: new Date(),
      userAgent: navigator.userAgent
    });
  } catch (error) {
    console.error('Error logging page view:', error);
  }
}

// Batch operations for better performance
async function batchUpdateUserData(uid, updates) {
  try {
    const batch = db.batch();
    const userRef = db.collection('users').doc(uid);
    
    batch.update(userRef, {
      ...updates,
      lastUpdated: new Date()
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error batch updating user data:', error);
    return false;
  }
}

// Real-time listeners
let commentsUnsubscribe = null;

function subscribeToComments(animeId, callback) {
  // Unsubscribe from previous listener
  if (commentsUnsubscribe) {
    commentsUnsubscribe();
  }
  
  // Subscribe to new comments
  commentsUnsubscribe = db.collection('comments')
    .where('animeId', '==', animeId)
    .orderBy('createdAt', 'desc')
    .limit(20)
    .onSnapshot(
      (snapshot) => {
        const comments = [];
        snapshot.forEach(doc => {
          comments.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(comments);
      },
      (error) => {
        console.error('Error subscribing to comments:', error);
      }
    );
}

// Cleanup function
function unsubscribeFromComments() {
  if (commentsUnsubscribe) {
    commentsUnsubscribe();
    commentsUnsubscribe = null;
  }
}

// Activity Feed / Social Features
async function addActivity(uid, activityType, animeId, animeData) {
  try {
    await db.collection('activities').add({
      uid: uid,
      username: userProfile.username,
      userAvatar: userProfile.avatar,
      type: activityType, // 'watched_episode', 'added_favorite', 'added_comment', 'completed_anime'
      animeId: animeId,
      animeTitle: animeData.title,
      animeImage: animeData.images?.jpg?.large_image_url,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error adding activity:', error);
  }
}

async function getUserActivity(uid, limit = 20) {
  try {
    const snapshot = await db.collection('activities')
      .where('uid', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    const activities = [];
    snapshot.forEach(doc => {
      activities.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return activities;
  } catch (error) {
    console.error('Error getting user activity:', error);
    return [];
  }
}

// Validation helpers
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validateUsername(username) {
  return username.length >= 3 && username.length <= 30;
}

function validateAnimeId(animeId) {
  return typeof animeId === 'number' || /^\d+$/.test(animeId);
             }
