//const BASE_URL = "https://nikita118.pythonanywhere.com/api";
// AUTH (Django)
export const AUTH_API = "https://nikita118.pythonanywhere.com";

// PLANT DISEASE (Render)
export const DISEASE_API = "https://your-plant-backend.onrender.com";

// CHATBOT (Render)
export const CHATBOT_API = "https://agriculture-chatbot-t94b.onrender.com";

// ---------------------
// Types
// ---------------------
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  token: string;
  user_type: "farmer" | "buyer";
}

export interface Batch {
  id: number;
  crop_name: string;
  details: string;
  quantity_kg: string;
  price_per_kg: string;
  farmer_id: number;    
  farmer?: any; 
  image_url?: string;
  doc_url?: string;
  is_sold: boolean;
  contract_address: string;
  create_tx_hash: string;
  qr_code_url: string;
  polygonscan_url: string;
  created_at: string;
  tx_hash?: string;
  on_chain?: any;
}

export interface Offer {
  id: number;
  batch_id: number;
  buyer_id: number;
  offered_price: string;
  is_accepted: boolean;
  is_rejected: boolean;
  reject_reason?: string;
  accept_tx_hash?: string;
  created_at: string;
  buyer?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    business_name?: string;
  };
}

// ---------------------
// COMMUNITY TYPES
// ---------------------

export interface Comment {
  id: number;
  post_id: number;
  content: string;
  author_id: number;
  author_name?: string;
  author_type: string;
  created_at: string;
}

export interface Post {
  id: number;
  content: string;
  image_url?: string;
  author_id: number;
  author_name?: string;
  author_type: string;
  like_count: number;
  created_at: string;
  comments: Comment[];
}

// ---------------------
// Helper for Authorization
// ---------------------
const getAuthHeaders = (token?: string) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  return headers;
};


// ---------------------
// AUTH API
// ---------------------
export const authAPI = {
  registerFarmer: async (data: any) => {
    const res = await fetch(`${AUTH_API}/farmers/register`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  loginFarmer: async (data: any) => {
    const res = await fetch(`${AUTH_API}/farmers/login`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  registerBuyer: async (data: any) => {
    const res = await fetch(`${AUTH_API}/buyers/register`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  loginBuyer: async (data: any) => {
    const res = await fetch(`${AUTH_API}/buyers/login`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};


// ---------------------
// PROFILE API
// ---------------------
export const profileAPI = {
  getFarmerProfile: async (token: string) => {
    const res = await fetch(`${AUTH_API}/farmers/verified`, {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  updateFarmerProfile: async (token: string, data: any) => {
    const res = await fetch(`${AUTH_API}/farmers/verified`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getBuyerProfile: async (token: string) => {
    const res = await fetch(`${AUTH_API}/buyers/verified`, {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  updateBuyerProfile: async (token: string, data: any) => {
    const res = await fetch(`${AUTH_API}/buyers/verified`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};


// ---------------------
// BATCH API
// ---------------------
export const batchAPI = {
  createBatch: async (token: string, data: any) => {
    const res = await fetch(`${AUTH_API}/batches/create/`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<Batch>;
  },

  listBatches: async () => {
    const res = await fetch(`${AUTH_API}/batches/`);
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<Batch[]>;
  },

  // NEW: Get farmer's own batches
  getMyBatches: async (token: string) => {
    const res = await fetch(`${AUTH_API}/batches/my/`, {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<Batch[]>;
  },

  getBatch: async (batchId: number) => {
    const res = await fetch(`${AUTH_API}/batches/${batchId}/`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getPublicBatch: async (batchId: number): Promise<any> => {
    const res = await fetch(`${AUTH_API}/public/batch/${batchId}/`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};



// ---------------------
// OFFER API
// ---------------------
export const offerAPI = {

  createOffer: async (token: string, data: any) => {
    const res = await fetch(`${AUTH_API}/offers/create/`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  listOffers: async (batchId: number) => {
    const res = await fetch(`${AUTH_API}/offers/${batchId}/`);
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<Offer[]>;
  },

  // NEW → Get offers made for a farmer's products
  getOffersForFarmer: async (token: string) => {
    const res = await fetch(`${AUTH_API}/offers/farmer/`, {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<any[]>;
  },

  // NEW → Offer Rejection
  rejectOffer: async (token: string, offerId: number, reason: string) => {
    const res = await fetch(`${AUTH_API}/offers/${offerId}/reject/`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // NEW → Offer History
  getOfferHistory: async (token: string) => {
    const res = await fetch(`${AUTH_API}/offers/history/`, {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<any[]>;
  },

  acceptOffer: async (token: string, offerId: number) => {
    const res = await fetch(`${AUTH_API}/offers/${offerId}/accept/`, {
      method: "POST",
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

    // NEW → Get offers made by the logged-in buyer
  getBuyerOffers: async (token: string) => {
    const res = await fetch(`${AUTH_API}/offers/buyer/`, {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<Offer[]>;
  },

};


// ---------------------
// QR SCAN API
// ---------------------
export const qrAPI = {
  scanBatch: async (batchId: number) => {
    const res = await fetch(`${AUTH_API}/public/batch/${batchId}/`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};


// ---------------------
// PURCHASE API
// ---------------------
export const purchaseAPI = {
  initiate: async (token: string, offerId: number) => {
    const res = await fetch(`${AUTH_API}/purchase/initiate/`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ offer_id: offerId }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  confirm: async (token: string, data: any) => {
    const res = await fetch(`${AUTH_API}/purchase/confirm/`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

    // NEW → Get purchases of logged-in buyer
  listBuyerPurchases: async (token: string) => {
    const res = await fetch(`${AUTH_API}/purchase/buyer/`, {
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

};


// ---------------------
// REVIEWS API
// ---------------------
export const reviewsAPI = {
  postReview: async (token: string, data: any) => {
    const res = await fetch(`${AUTH_API}/reviews/post/`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getFarmerReviews: async (farmerId: number) => {
    const res = await fetch(`${AUTH_API}/reviews/farmer/${farmerId}/`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};


export const communityAPI = {

  // GET feed
  getFeed: async () => {
    const res = await fetch(`${AUTH_API}/community/feed`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // CREATE post
  createPost: async (token: string, data: any) => {
    const res = await fetch(`${AUTH_API}/community/posts`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // LIKE post
  likePost: async (token: string, postId: number) => {
    const res = await fetch(`${AUTH_API}/community/posts/${postId}/like`, {
      method: "POST",
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // UNLIKE post (optional)
  unlikePost: async (token: string, postId: number) => {
    const res = await fetch(`${AUTH_API}/community/posts/${postId}/unlike`, {
      method: "POST",
      headers: getAuthHeaders(token),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // COMMENT on post
  commentOnPost: async (token: string, postId: number, data: any) => {
    const res = await fetch(`${AUTH_API}/community/posts/${postId}/comments`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
