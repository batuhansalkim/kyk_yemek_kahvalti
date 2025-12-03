import PropTypes from 'prop-types';
import { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import axios from 'axios';
import {
  ChevronLeft,
  ChevronRight,
  Coffee,
  Utensils,
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Phone,
  Star,
  Sparkles,
  X,
  MessageCircle,
  ArrowRight,
  Percent
} from "lucide-react";
import "./MobileMealPlanner.css";
import { userTracker } from './firebase/userTracker';
import { database } from './firebase/config';
import { ref, set, onValue } from 'firebase/database';


const DayComponent = ({ data, animationClass, onLike, onDislike, likes, dislikes, isUniversity = false }) => {
  const today = new Date();
  const todayString = today.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const mealDate = new Date(data.tarih.split('.').reverse().join('-'));
  const isDatePassed = mealDate <= today;

  // Üniversite verisi için farklı render
  if (isUniversity) {
    return (
      <div className={`day-component day-component-university ${animationClass}`}>
        <h2 className="day-title day-title-university">
          {data.gun}, {data.tarih}
        </h2>
        <div className="meal-section meal-section-university">
          <div className="meal-header meal-header-university">
            <h3 className="meal-title meal-title-university dinner">
              <Utensils className="meal-icon meal-icon-university" />
              Öğle Yemeği
            </h3>
          </div>
          <p className="meal-text meal-text-university">{data.ogle || "Menü bilgisi bulunamadı"}</p>
        </div>
      </div>
    );
  }

  // KYK verisi için mevcut render
  return (
    <div className={`day-component day-component-kyk ${animationClass}`}>
      <h2 className="day-title day-title-kyk">
        {data.gun}, {data.tarih}
      </h2>
      <div className="meals-container">
        <div className="meal-section meal-section-kyk">
          <div className="meal-header meal-header-kyk">
            <h3 className="meal-title meal-title-kyk breakfast">
              <Coffee className="meal-icon meal-icon-kyk" /> Kahvaltı
            </h3>
          </div>
          <p className="meal-text meal-text-kyk">{data.kahvalti.ana_urun}</p>
          <p className="meal-text meal-text-kyk">{data.kahvalti.ana_urun2}</p>
          <p className="meal-text meal-text-kyk">
            {Array.isArray(data.kahvalti.kahvaltilik)
              ? data.kahvalti.kahvaltilik.join(", ")
              : ""}
          </p>
          <p className="drink-text meal-text-kyk">{data.kahvalti.icecek}</p>
          <p className="meal-text meal-text-kyk">
            {data.kahvalti.ekmek}, {data.kahvalti.su}
          </p>
        </div>
        <div className="meal-section meal-section-kyk">
          <div className="meal-header meal-header-kyk">
            <h3 className="meal-title meal-title-kyk dinner">
              <Utensils className="meal-icon meal-icon-kyk" />
              Akşam Yemeği
            </h3>
          </div>
          <p className="meal-text meal-text-kyk">{data.ogle_aksam.corba}</p>
          <p className="meal-text meal-text-kyk">{data.ogle_aksam.ana_yemek}</p>
          <p className="meal-text meal-text-kyk">{data.ogle_aksam.yardimci_yemek}</p>
          <p className="meal-text meal-text-kyk">{data.ogle_aksam.ek}</p>
          <p className="meal-text meal-text-kyk">
            {data.ogle_aksam.ekmek}, {data.ogle_aksam.su}
          </p>
        </div>
      </div>
    </div>
  );
};

DayComponent.propTypes = {
  data: PropTypes.shape({
    gun: PropTypes.string.isRequired,
    tarih: PropTypes.string.isRequired,
    kahvalti: PropTypes.oneOfType([
      PropTypes.shape({
        corba: PropTypes.string.isRequired,
        ana_urun: PropTypes.string.isRequired,
        ana_urun2: PropTypes.string.isRequired,
        kahvaltilik: PropTypes.arrayOf(PropTypes.string),
        icecek: PropTypes.string.isRequired,
        ekmek: PropTypes.string.isRequired,
        su: PropTypes.string.isRequired
      }),
      PropTypes.string
    ]).isRequired,
    ogle_aksam: PropTypes.shape({
      corba: PropTypes.string.isRequired,
      ana_yemek: PropTypes.string.isRequired,
      yardimci_yemek: PropTypes.string.isRequired,
      ek: PropTypes.string.isRequired,
      ekmek: PropTypes.string.isRequired,
      su: PropTypes.string.isRequired
    }),
    ogle: PropTypes.string,
    aksam: PropTypes.string
  }).isRequired,
  animationClass: PropTypes.string.isRequired,
  onLike: PropTypes.func.isRequired,
  onDislike: PropTypes.func.isRequired,
  likes: PropTypes.object.isRequired,
  dislikes: PropTypes.object.isRequired,
  isUniversity: PropTypes.bool
};

// İşletme Kartı Bileşeni
const BusinessCard = ({ business, onViewDetails }) => {
  return (
    <div className="business-card">
      <div className="business-header">
        <h3 className="business-name">{business.name}</h3>
        <button 
          className="view-details-btn"
          onClick={() => onViewDetails(business)}
        >
          Detayı Gör
          <ArrowRight className="arrow-icon" size={14} />
        </button>
      </div>
      
      {business.featuredMenu && (
        <div className="featured-menu">
          <div className="discount-badge">
            <Percent className="percent-icon" size={14} />
            <span>İndirimli</span>
          </div>
          <div className="featured-menu-content">
            <div className="featured-menu-header">
              <span className="featured-menu-name">{business.featuredMenu.name}</span>
              <div className="price-container">
                {business.featuredMenu.oldPrice && (
                  <span className="old-price">{business.featuredMenu.oldPrice}₺</span>
                )}
                <span className="featured-menu-price">{business.featuredMenu.price}₺</span>
              </div>
            </div>
            <p className="featured-menu-items">{business.featuredMenu.items}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Kampanyalar Sayfası Bileşeni
const CampaignsPage = ({ businesses, onClose }) => {
  const priorityBusinesses = businesses.slice(0, 3);
  const otherBusinesses = businesses.slice(3);

  const handleWhatsApp = (business) => {
    const message = encodeURIComponent(`Merhaba, ${business.name} hakkında bilgi almak istiyorum.`);
    window.open(`https://wa.me/${business.whatsapp.replace(/\s/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="campaigns-page">
      <div className="campaigns-page-header">
        <h1 className="campaigns-page-title">Kampanyalar</h1>
      </div>

      <div className="campaigns-page-content">
        {/* Öncelikli İşletmeler */}
        <div className="priority-businesses">
          {priorityBusinesses.map((business, index) => (
            <div key={business.id} className={`business-detail-card card-variant-${(index % 2) + 1}`}>
              <div className="business-detail-header">
                <h2 className="business-detail-name">{business.name}</h2>
              </div>

              {/* Öne Çıkan Menü */}
              {business.featuredMenu && (
                <div className="featured-menu-detail">
                  <div className="featured-menu-badge">
                    <Sparkles className="sparkle-icon" size={14} />
                    <span>Öne Çıkan</span>
                  </div>
                  <div className="featured-menu-info">
                    <h3 className="featured-menu-title">{business.featuredMenu.name}</h3>
                    <p className="featured-menu-desc">{business.featuredMenu.items}</p>
                    <div className="featured-price-container">
                      {business.featuredMenu.oldPrice && (
                        <span className="featured-old-price">{business.featuredMenu.oldPrice}₺</span>
                      )}
                      <span className="featured-new-price">{business.featuredMenu.price}₺</span>
                    </div>
                  </div>
                </div>
              )}

              {/* İndirimli Menüler */}
              {business.discountMenus && business.discountMenus.length > 0 && (
                <div className="detail-section">
                  <h3 className="detail-section-title">
                    <Percent className="section-icon" size={16} />
                    İndirimli Menüler
                  </h3>
                  <div className="detail-menus">
                    {business.discountMenus.map((menu, index) => (
                      <div key={index} className="detail-menu-item">
                        <div className="detail-menu-header">
                          <span className="detail-menu-name">{menu.name}</span>
                          <div className="detail-price-container">
                            {menu.oldPrice && (
                              <span className="detail-old-price">{menu.oldPrice}₺</span>
                            )}
                            <span className="detail-menu-price">{menu.price}₺</span>
                          </div>
                        </div>
                        <p className="detail-menu-items">{menu.items}</p>
                        {menu.discount && (
                          <span className="detail-discount-tag">%{menu.discount} İndirim</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kampanyalı Menüler */}
              {business.campaignMenus && business.campaignMenus.length > 0 && (
                <div className="detail-section">
                  <h3 className="detail-section-title">
                    <Sparkles className="section-icon" size={16} />
                    Kampanyalı Menüler
                  </h3>
                  <div className="detail-menus">
                    {business.campaignMenus.map((menu, index) => (
                      <div key={index} className="detail-menu-item">
                        <div className="detail-menu-header">
                          <span className="detail-menu-name">{menu.name}</span>
                          <span className="detail-menu-price">{menu.price}₺</span>
                        </div>
                        <p className="detail-menu-items">{menu.items}</p>
                        {menu.campaign && (
                          <span className="detail-campaign-tag">{menu.campaign}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WhatsApp Butonu */}
              <button 
                className="business-whatsapp-btn" 
                onClick={() => handleWhatsApp(business)}
              >
                <MessageCircle className="whatsapp-icon" size={18} />
                <span>WhatsApp ile İletişime Geç</span>
              </button>
            </div>
          ))}
        </div>

        {/* Diğer İşletmeler */}
        {otherBusinesses.length > 0 && (
          <div className="other-businesses">
            <h2 className="other-businesses-title">Diğer İşletmeler</h2>
            {otherBusinesses.map((business, index) => (
              <div key={business.id} className={`business-detail-card card-variant-${((priorityBusinesses.length + index) % 2) + 1}`}>
                <div className="business-detail-header">
                  <h2 className="business-detail-name">{business.name}</h2>
                </div>

                {/* Öne Çıkan Menü */}
                {business.featuredMenu && (
                  <div className="featured-menu-detail">
                    <div className="featured-menu-badge">
                      <Sparkles className="sparkle-icon" size={14} />
                      <span>Öne Çıkan</span>
                    </div>
                    <div className="featured-menu-info">
                      <h3 className="featured-menu-title">{business.featuredMenu.name}</h3>
                      <p className="featured-menu-desc">{business.featuredMenu.items}</p>
                      <div className="featured-price-container">
                        {business.featuredMenu.oldPrice && (
                          <span className="featured-old-price">{business.featuredMenu.oldPrice}₺</span>
                        )}
                        <span className="featured-new-price">{business.featuredMenu.price}₺</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* İndirimli Menüler */}
                {business.discountMenus && business.discountMenus.length > 0 && (
                  <div className="detail-section">
                    <h3 className="detail-section-title">
                      <Percent className="section-icon" size={16} />
                      İndirimli Menüler
                    </h3>
                    <div className="detail-menus">
                      {business.discountMenus.map((menu, index) => (
                        <div key={index} className="detail-menu-item">
                          <div className="detail-menu-header">
                            <span className="detail-menu-name">{menu.name}</span>
                            <div className="detail-price-container">
                              {menu.oldPrice && (
                                <span className="detail-old-price">{menu.oldPrice}₺</span>
                              )}
                              <span className="detail-menu-price">{menu.price}₺</span>
                            </div>
                          </div>
                          <p className="detail-menu-items">{menu.items}</p>
                          {menu.discount && (
                            <span className="detail-discount-tag">%{menu.discount} İndirim</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Kampanyalı Menüler */}
                {business.campaignMenus && business.campaignMenus.length > 0 && (
                  <div className="detail-section">
                    <h3 className="detail-section-title">
                      <Sparkles className="section-icon" size={16} />
                      Kampanyalı Menüler
                    </h3>
                    <div className="detail-menus">
                      {business.campaignMenus.map((menu, index) => (
                        <div key={index} className="detail-menu-item">
                          <div className="detail-menu-header">
                            <span className="detail-menu-name">{menu.name}</span>
                            <span className="detail-menu-price">{menu.price}₺</span>
                          </div>
                          <p className="detail-menu-items">{menu.items}</p>
                          {menu.campaign && (
                            <span className="detail-campaign-tag">{menu.campaign}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* WhatsApp Butonu */}
                <button 
                  className="business-whatsapp-btn" 
                  onClick={() => handleWhatsApp(business)}
                >
                  <MessageCircle className="whatsapp-icon" size={18} />
                  <span>WhatsApp ile İletişime Geç</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Kampanyalar Modal Bileşeni
const CampaignsModal = ({ business, isOpen, onClose }) => {
  if (!isOpen || !business) return null;

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Merhaba, ${business.name} hakkında bilgi almak istiyorum.`);
    window.open(`https://wa.me/${business.whatsapp.replace(/\s/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="campaigns-modal-overlay" onClick={onClose}>
      <div className="campaigns-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{business.name}</h2>
          <X 
            className="close-x-icon"
            size={28} 
            strokeWidth={3} 
            onClick={onClose}
            style={{ 
              cursor: 'pointer',
              color: '#ffffff',
              stroke: '#ffffff',
              flexShrink: 0
            }}
          />
        </div>

        <div className="modal-content">
          {/* İndirimli Menüler */}
          {business.discountMenus && business.discountMenus.length > 0 && (
            <div className="campaign-section">
              <h3 className="campaign-section-title">
                <Percent className="section-icon" size={18} />
                İndirimli Menüler
              </h3>
              <div className="campaign-menus">
                {business.discountMenus.map((menu, index) => (
                  <div key={index} className="campaign-menu-item">
                    <div className="campaign-menu-header">
                      <span className="campaign-menu-name">{menu.name}</span>
                      <div className="price-container">
                        {menu.oldPrice && (
                          <span className="old-price">{menu.oldPrice}₺</span>
                        )}
                        <span className="campaign-menu-price">{menu.price}₺</span>
                      </div>
                    </div>
                    <p className="campaign-menu-items">{menu.items}</p>
                    {menu.discount && (
                      <span className="discount-tag">%{menu.discount} İndirim</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kampanyalı Menüler */}
          {business.campaignMenus && business.campaignMenus.length > 0 && (
            <div className="campaign-section">
              <h3 className="campaign-section-title">
                <Sparkles className="section-icon" size={18} />
                Kampanyalı Menüler
              </h3>
              <div className="campaign-menus">
                {business.campaignMenus.map((menu, index) => (
                  <div key={index} className="campaign-menu-item">
                    <div className="campaign-menu-header">
                      <span className="campaign-menu-name">{menu.name}</span>
                      <span className="campaign-menu-price">{menu.price}₺</span>
                    </div>
                    <p className="campaign-menu-items">{menu.items}</p>
                    {menu.campaign && (
                      <span className="campaign-tag">{menu.campaign}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WhatsApp Butonu */}
          <div className="whatsapp-section">
            <button className="whatsapp-btn" onClick={handleWhatsApp}>
              <MessageCircle className="whatsapp-icon" size={20} />
              <span>WhatsApp ile İletişime Geç</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

BusinessCard.propTypes = {
  business: PropTypes.shape({
    name: PropTypes.string.isRequired,
    featuredMenu: PropTypes.shape({
      name: PropTypes.string.isRequired,
      items: PropTypes.string.isRequired,
      price: PropTypes.string.isRequired,
      oldPrice: PropTypes.string
    }),
    discountMenus: PropTypes.array,
    campaignMenus: PropTypes.array,
    whatsapp: PropTypes.string.isRequired
  }).isRequired,
  onViewDetails: PropTypes.func.isRequired
};

CampaignsModal.propTypes = {
  business: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

CampaignsPage.propTypes = {
  businesses: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClose: PropTypes.func.isRequired
};

export default function MobileMealPlanner() {
  const [mealPlan, setMealPlan] = useState([]);
  const [universityMeals, setUniversityMeals] = useState([]);
  const [universityCurrentIndex, setUniversityCurrentIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [likes, setLikes] = useState({});
  const [dislikes, setDislikes] = useState({});
  const [activeTab, setActiveTab] = useState('kyk'); // 'kyk', 'university' veya 'campaigns'
  const [loading, setLoading] = useState(false);
  
  // 3 İşletme Verileri
  const [businesses] = useState([
    {
      id: 1,
      name: "Lezzet Döner",
      whatsapp: "905321234567",
      featuredMenu: {
        name: "Özel Menü",
        items: "DÜRÜM + AYRAN + CİPS",
        price: "125",
        oldPrice: "150"
      },
      discountMenus: [
        {
          name: "Öğrenci Menüsü",
          items: "DÜRÜM + AYRAN + CİPS",
          price: "125",
          oldPrice: "150",
          discount: "17"
        },
        {
          name: "Zurna Özel",
          items: "ZURNA + AYRAN + CİPS",
          price: "150",
          oldPrice: "180",
          discount: "17"
        }
      ],
      campaignMenus: [
        {
          name: "Hafta Sonu Özel",
          items: "ZURNA + KOLA + CİPS",
          price: "180",
          campaign: "Hafta Sonu %10 Ekstra İndirim"
        }
      ]
    },
    {
      id: 2,
      name: "Burger House",
      whatsapp: "905321234568",
      featuredMenu: {
        name: "Kampanya Menü",
        items: "BURGER + PATATES + İÇECEK",
        price: "95",
        oldPrice: "120"
      },
      discountMenus: [
        {
          name: "Çift Burger",
          items: "2x BURGER + PATATES + İÇECEK",
          price: "160",
          oldPrice: "200",
          discount: "20"
        }
      ],
      campaignMenus: [
        {
          name: "Öğrenci Özel",
          items: "BURGER + PATATES + İÇECEK",
          price: "95",
          campaign: "Öğrenci Kartı ile %20 İndirim"
        }
      ]
    },
    {
      id: 3,
      name: "Pizza Corner",
      whatsapp: "905321234569",
      featuredMenu: {
        name: "İndirimli Pizza",
        items: "ORTA PIZZA + İÇECEK",
        price: "110",
        oldPrice: "140"
      },
      discountMenus: [
        {
          name: "Büyük Pizza",
          items: "BÜYÜK PIZZA + İÇECEK",
          price: "150",
          oldPrice: "180",
          discount: "17"
        }
      ],
      campaignMenus: [
        {
          name: "2 Pizza 1 Fiyat",
          items: "2x ORTA PIZZA",
          price: "140",
          campaign: "2 Pizza Al 1 Öde Kampanyası"
        }
      ]
    },
    {
      id: 4,
      name: "Kebap Evi",
      whatsapp: "905321234570",
      featuredMenu: {
        name: "Öğrenci Özel",
        items: "ADANA KEBAP + AYRAN + PİLAV",
        price: "130",
        oldPrice: "160"
      },
      discountMenus: [
        {
          name: "Karışık Tabağı",
          items: "ADANA + URFA + TAVUK ŞİŞ + PİLAV + AYRAN",
          price: "200",
          oldPrice: "250",
          discount: "20"
        }
      ],
      campaignMenus: [
        {
          name: "Hafta İçi Özel",
          items: "ADANA KEBAP + AYRAN + PİLAV",
          price: "130",
          campaign: "Hafta İçi %18 İndirim"
        }
      ]
    },
    {
      id: 5,
      name: "Çorba Evi",
      whatsapp: "905321234571",
      featuredMenu: {
        name: "Çorba Menü",
        items: "ÇORBA + PİDE + AYRAN",
        price: "75",
        oldPrice: "95"
      },
      discountMenus: [
        {
          name: "Çift Çorba",
          items: "2x ÇORBA + PİDE + AYRAN",
          price: "120",
          oldPrice: "150",
          discount: "20"
        }
      ],
      campaignMenus: [
        {
          name: "Sabah Özel",
          items: "ÇORBA + PİDE + AYRAN",
          price: "75",
          campaign: "Sabah 08:00-11:00 Arası Özel Fiyat"
        }
      ]
    }
  ]);

  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCampaignsPage, setShowCampaignsPage] = useState(false);

  const handleViewDetails = (business) => {
    setSelectedBusiness(business);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBusiness(null);
  };

  const handleOpenCampaigns = () => {
    setActiveTab('campaigns');
    setShowCampaignsPage(true);
  };

  const handleCloseCampaignsPage = () => {
    setShowCampaignsPage(false);
    setActiveTab('kyk'); // Kampanyalar kapatıldığında KYK'ya dön
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  }, []);

  useEffect(() => {
    const loadRatings = async () => {
      try {
        const likesRef = ref(database, 'ratings/likes');
        const dislikesRef = ref(database, 'ratings/dislikes');
        
        onValue(likesRef, (snapshot) => {
          setLikes(snapshot.val() || {});
        });
        
        onValue(dislikesRef, (snapshot) => {
          setDislikes(snapshot.val() || {});
        });
      } catch (error) {
        console.error('Beğeni verileri yüklenemedi:', error);
      }
    };

    loadRatings();
  }, []);

  const handleLike = async (date, meal) => {
    try {
      const likesRef = ref(database, `ratings/likes/${date}/${meal}`);
      const dislikesRef = ref(database, `ratings/dislikes/${date}/${meal}`);
      
      const currentLikes = (likes[`${date}_${meal}`] || 0);
      const currentDislikes = (dislikes[`${date}_${meal}`] || 0);
      
      console.log(`Beğeni ekleniyor: ${date} - ${meal}`);
      await set(likesRef, currentLikes + 1);
      console.log('Beğeni başarıyla eklendi');
      
      if (currentDislikes > 0) {
        await set(dislikesRef, currentDislikes - 1);
        console.log('Dislike sayısı azaltıldı');
      }
    } catch (error) {
      console.error('Beğeni eklenirken hata:', error);
    }
  };

  const handleDislike = async (date, meal) => {
    try {
      const likesRef = ref(database, `ratings/likes/${date}/${meal}`);
      const dislikesRef = ref(database, `ratings/dislikes/${date}/${meal}`);
      
      const currentLikes = (likes[`${date}_${meal}`] || 0);
      const currentDislikes = (dislikes[`${date}_${meal}`] || 0);
      
      console.log(`Dislike ekleniyor: ${date} - ${meal}`);
      await set(dislikesRef, currentDislikes + 1);
      console.log('Dislike başarıyla eklendi');
      
      if (currentLikes > 0) {
        await set(likesRef, currentLikes - 1);
        console.log('Like sayısı azaltıldı');
      }
    } catch (error) {
      console.error('Beğenmeme eklenirken hata:', error);
    }
  };


  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setAlertMessage("");
  };

  useEffect(() => {
    fetch("/aralik.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error('Veri yüklenemedi');
        }
        return response.json();
      })
      .then((data) => {
        if (!data || !data.Ekim_2025 || !Array.isArray(data.Ekim_2025)) {
          throw new Error('Veri formatı geçersiz');
        }

        setMealPlan(data.Ekim_2025);
        
        // Tarih formatlama
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        const todayString = `${day}.${month}.${year}`;

        console.log("Bugünün tarihi:", todayString);
        console.log("Yüklenen veri sayısı:", data.Ekim_2025.length);
        console.log("İlk tarih:", data.Ekim_2025[0]?.tarih);
        console.log("Son tarih:", data.Ekim_2025[data.Ekim_2025.length - 1]?.tarih);

        const todayIndex = data.Ekim_2025.findIndex(
          (day) => day && day.tarih === todayString
        );

        const initialIndex = todayIndex >= 0 ? todayIndex : 0;
        setCurrentIndex(initialIndex);
        setStartIndex(initialIndex);
      })
      .catch((error) => {
        console.error("Yemek planı yüklenirken hata oluştu:", error);
        setMealPlan([]);
      });
  }, []);

  // Üniversite menülerini yükle
  useEffect(() => {
    fetch("/aralikveriler.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error('Üniversite verisi yüklenemedi');
        }
        return response.json();
      })
      .then((data) => {
        if (data.university_menus && Array.isArray(data.university_menus)) {
          setUniversityMeals(data.university_menus);
          
          // Bugünün tarihini bul
          const today = new Date();
          const todayString = today.toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
          
          const todayIndex = data.university_menus.findIndex(
            (menu) => menu.tarih === todayString
          );
          
          const initialIndex = todayIndex >= 0 ? todayIndex : 0;
          setUniversityCurrentIndex(initialIndex);
        }
      })
      .catch((error) => {
        console.error("Üniversite menüleri yüklenirken hata:", error);
      });
  }, []);


  const handleNavigation = (direction) => {
    setAnimationClass(
      direction === "next" ? "slide-out-left" : "slide-out-right"
    );
    setTimeout(() => {
      if (activeTab === 'kyk') {
        setCurrentIndex((prev) => {
          const newIndex = direction === "next" ? prev + 1 : prev - 1;
          const maxForward = Math.min(startIndex + 5, mealPlan.length - 1);
          const maxBackward = Math.max(startIndex - 5, 0);
          if (newIndex > maxForward) {
            setAlertMessage("En fazla 5 gün sonraki yemeği görebilirsiniz.");
            return prev;
          } else if (newIndex < maxBackward) {
            setAlertMessage("En fazla 5 gün önceki yemeği görebilirsiniz.");
            return prev;
          }
          setAlertMessage("");
          return newIndex;
        });
      } else if (activeTab === 'university') {
        setUniversityCurrentIndex((prev) => {
          const newIndex = direction === "next" ? prev + 1 : prev - 1;
          if (newIndex < 0) {
            setAlertMessage("İlk menüye ulaştınız.");
            return prev;
          } else if (newIndex >= universityMeals.length) {
            setAlertMessage("Son menüye ulaştınız.");
            return prev;
          }
          setAlertMessage("");
          return newIndex;
        });
      }
      setAnimationClass(
        direction === "next" ? "slide-in-right" : "slide-in-left"
      );
    }, 300);
  };
  const handlers = useSwipeable({
    onSwipedLeft: () => handleNavigation("next"),
    onSwipedRight: () => handleNavigation("prev"),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        await userTracker.incrementActiveUsers();
        await userTracker.incrementTotalVisits();
      } catch (error) {
        console.error('Firebase işlemleri başlatılamadı:', error);
      }
    };

    initializeFirebase();

    return () => {
      userTracker.decrementActiveUsers().catch(error => {
        console.error('Aktif kullanıcı sayısı azaltılamadı:', error);
      });
    };
  }, []);

  // Kampanyalar sayfası gösteriliyorsa
  if (showCampaignsPage) {
    return (
      <div className="meal-planner campaigns-page-active">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'kyk' ? 'active' : ''}`}
            onClick={() => {
              setShowCampaignsPage(false);
              handleTabChange('kyk');
            }}
          >
            KYK
          </button>
          <button
            className={`tab-button ${activeTab === 'university' ? 'active' : ''}`}
            onClick={() => {
              setShowCampaignsPage(false);
              handleTabChange('university');
            }}
          >
            Üniversite
          </button>
          <button
            className={`tab-button ${activeTab === 'campaigns' ? 'active' : ''}`}
            onClick={() => {}}
          >
            Kampanyalar
          </button>
        </div>

        <CampaignsPage
          businesses={businesses}
          onClose={handleCloseCampaignsPage}
        />
      </div>
    );
  }

  return (
    <div className="meal-planner">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'kyk' ? 'active' : ''}`}
          onClick={() => handleTabChange('kyk')}
        >
          KYK
        </button>
        <button
          className={`tab-button ${activeTab === 'university' ? 'active' : ''}`}
          onClick={() => handleTabChange('university')}
        >
          Üniversite
        </button>
        <button
          className={`tab-button ${activeTab === 'campaigns' ? 'active' : ''}`}
          onClick={handleOpenCampaigns}
        >
          Kampanyalar
        </button>
      </div>

      <div className="planner-container" {...handlers}>
        {activeTab === 'kyk' ? (
          // KYK Menüsü
          <>
            {/* İşletme Reklamları - Sadece İlk 2 */}
            <div className="businesses-container">
              {businesses.slice(0, 2).map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
            
            {Array.isArray(mealPlan) && mealPlan.length > 0 && currentIndex >= 0 && mealPlan[currentIndex] ? (
              <>
                <DayComponent
                  data={mealPlan[currentIndex]}
                  animationClass={animationClass}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  likes={likes}
                  dislikes={dislikes}
                  isUniversity={false}
                />
                {alertMessage && (
                  <div className="alert-message">
                    <p>{alertMessage}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="error-message">
                <p>Yemek planı yüklenemedi. Lütfen daha sonra tekrar deneyiniz.</p>
              </div>
            )}
          </>
        ) : (
          // Üniversite Menüsü
          <>
            {/* İşletme Reklamları - Sadece İlk 2 */}
            <div className="businesses-container">
              {businesses.slice(0, 2).map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
            
            {universityMeals.length > 0 && universityCurrentIndex >= 0 && universityMeals[universityCurrentIndex] ? (
              <DayComponent
                data={universityMeals[universityCurrentIndex]}
                animationClass={animationClass}
                onLike={handleLike}
                onDislike={handleDislike}
                likes={likes}
                dislikes={dislikes}
                isUniversity={true}
              />
            ) : (
              <div className="error-message">
                <p>Üniversite menüsü yüklenemedi. Lütfen daha sonra tekrar deneyiniz.</p>
              </div>
            )}
          </>
        )}
        
        {alertMessage && activeTab === 'university' && (
          <div className="alert-message">
            <p>{alertMessage}</p>
          </div>
        )}
      </div>

      {/* Navigation buttons - her iki tab için de göster */}
      <div className="navigation-buttons">
        <button
          className="nav-button"
          onClick={() => handleNavigation("prev")}
          disabled={
            activeTab === 'kyk' 
              ? currentIndex <= Math.max(startIndex - 5, 0)
              : universityCurrentIndex <= 0
          }
        >
          <ChevronLeft className="button-icon" />
          Önceki
        </button>
        <button
          className="nav-button"
          onClick={() => handleNavigation("next")}
          disabled={
            activeTab === 'kyk' 
              ? currentIndex >= Math.min(startIndex + 5, mealPlan.length - 1)
              : universityCurrentIndex >= universityMeals.length - 1
          }
        >
          Sonraki
          <ChevronRight className="button-icon" />
        </button>
      </div>

      <div className="developer-credit">
        Developed by{" "}
        <a href="https://www.linkedin.com/in/batuhanslkmm/" target="_blank" rel="noopener noreferrer">
          Batuhan Salkım
        </a>
        {" , "}
        <a href="https://www.linkedin.com/in/ahmetcaliskann/" target="_blank" rel="noopener noreferrer">
          Ahmet Çalışkan
        </a>
       {" & "}
        <a href="https://www.linkedin.com/in/yusuf-uyr/" target="_blank" rel="noopener noreferrer">
          Yusuf Uyar
        </a>
      </div>

      {/* Kampanyalar Modal */}
      <CampaignsModal
        business={selectedBusiness}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

    </div>
  );
}


// export default function MobileMealPlanner() {
//   return (
//     <div style={{
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'center',
//       minHeight: '100vh',
//       minWidth: '100vw',
//       margin: 0,
//       padding: 0,
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: '#1a1a1a',
//       color: '#ffffff'
//     }}>
//       <div style={{
//         backgroundColor: '#f8d7da',
//         color: '#721c24',
//         padding: '1.5rem',
//         borderRadius: '12px',
//         width: '85%',
//         maxWidth: '400px',
//         margin: '0 auto',
//         fontWeight: 'bold',
//         fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
//         boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//         textAlign: 'center',
//         lineHeight: '1.4'
//       }}>
//         Hayırlı Ramazanlar!<br />Site Bakımda
//       </div>
//     </div>
//   );
// }