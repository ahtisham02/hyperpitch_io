const CONTACT_LISTS_KEY = 'hyperpitch_contact_lists';
const CAMPAIGNS_KEY = 'hyperpitch_campaigns';

// --- Contact List Functions (existing) ---
export const getContactLists = () => {
  try {
    const lists = localStorage.getItem(CONTACT_LISTS_KEY);
    return lists ? JSON.parse(lists) : [];
  } catch (error) {
    console.error("Error reading contact lists from localStorage:", error);
    return [];
  }
};
// ... (other contact functions: saveContactLists, addContactList, etc. remain)
export const saveContactLists = (lists) => {
  try {
    localStorage.setItem(CONTACT_LISTS_KEY, JSON.stringify(lists));
  } catch (error) {
    console.error("Error saving contact lists to localStorage:", error);
  }
};
export const addContactList = (listName, contacts) => {
  const lists = getContactLists();
  const newList = { 
    id: `list-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, 
    name: listName, 
    contacts: contacts.map((contact, index) => ({ ...contact, id: `contact-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 5)}` })),
    createdAt: new Date().toISOString() 
  };
  lists.push(newList);
  saveContactLists(lists);
  return newList;
};
export const getContactListById = (listId) => {
  const lists = getContactLists();
  return lists.find(list => list.id === listId);
};
export const deleteContactList = (listId) => {
  let lists = getContactLists();
  lists = lists.filter(list => list.id !== listId);
  saveContactLists(lists);
};
export const updateContactInList = (listId, contactId, updatedContactData) => {
    const lists = getContactLists();
    const listIndex = lists.findIndex(l => l.id === listId);
    if (listIndex > -1) {
        const contactIndex = lists[listIndex].contacts.findIndex(c => c.id === contactId);
        if (contactIndex > -1) {
            lists[listIndex].contacts[contactIndex] = { ...lists[listIndex].contacts[contactIndex], ...updatedContactData };
            lists[listIndex].updatedAt = new Date().toISOString();
            saveContactLists(lists);
            return true;
        }
    }
    return false;
};
export const deleteContactFromList = (listId, contactId) => {
    const lists = getContactLists();
    const listIndex = lists.findIndex(l => l.id === listId);
    if (listIndex > -1) {
        lists[listIndex].contacts = lists[listIndex].contacts.filter(c => c.id !== contactId);
        lists[listIndex].updatedAt = new Date().toISOString();
        saveContactLists(lists);
        return true;
    }
    return false;
};


// --- Campaign Functions (NEW) ---
export const getCampaigns = () => {
  try {
    const campaigns = localStorage.getItem(CAMPAIGNS_KEY);
    return campaigns ? JSON.parse(campaigns) : [];
  } catch (error) {
    console.error("Error reading campaigns from localStorage:", error);
    return [];
  }
};

export const saveCampaigns = (campaigns) => {
  try {
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
  } catch (error) {
    console.error("Error saving campaigns to localStorage:", error);
  }
};

export const addOrUpdateCampaign = (campaignData) => {
  const campaigns = getCampaigns();
  const existingCampaignIndex = campaigns.findIndex(c => c.id === campaignData.id);

  if (existingCampaignIndex > -1) {
    // Update existing campaign
    campaigns[existingCampaignIndex] = { 
        ...campaigns[existingCampaignIndex], 
        ...campaignData,
        updatedAt: new Date().toISOString()
    };
  } else {
    // Add new campaign
    const newCampaign = {
      ...campaignData,
      id: campaignData.id || `camp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Ensure ID if not provided
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    campaigns.push(newCampaign);
  }
  saveCampaigns(campaigns.sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt))); // Sort by most recently updated
  return campaignData.id || campaigns.find(c => c.createdAt === campaignData.createdAt)?.id; // Return ID
};

export const getCampaignById = (campaignId) => {
  const campaigns = getCampaigns();
  return campaigns.find(c => c.id === campaignId);
};

export const deleteCampaign = (campaignId) => {
  let campaigns = getCampaigns();
  campaigns = campaigns.filter(c => c.id !== campaignId);
  saveCampaigns(campaigns);
};