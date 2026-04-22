// Inizializzazione Supabase ritardata o protetta
let supabase;

document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');
    
    // Attendi 2500 millisecondi per lo splash screen
    setTimeout(() => {
        if (splashScreen) {
            splashScreen.classList.add('fade-out');
            setTimeout(() => {
                splashScreen.style.display = 'none';
                if (mainContent) {
                    mainContent.style.display = 'flex';
                }
            }, 500); 
        }
    }, 2500);
    
    // --- LOGICA SUPABASE ---
    try {
        const supabaseUrl = 'https://jkutiliijqlintgevfho.supabase.co';
        const supabaseKey = 'sb_publishable_LrPZbxur2A4cakSvTbwkgA_cIygcsY5';
        if (window.supabase) {
            supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        } else {
            console.warn('Supabase non è stato caricato correttamente.');
        }
    } catch (err) {
        console.error('Errore inizializzazione Supabase:', err);
    }
    
    // 1. Lettura Live: Aggiorna il contatore
    const countSpan = document.getElementById('count');
    const updateCounter = async () => {
        if (!supabase) return;
        try {
            const { count, error } = await supabase
                .from('waitlist_users')
                .select('*', { count: 'exact', head: true });
            
            if (error) throw error;
            if (count !== null && countSpan) {
                countSpan.textContent = count;
            }
        } catch (error) {
            console.error('Errore conteggio:', error);
        }
    };
    
    updateCounter();

    // 2. Scrittura: Inviare form
    const form = document.getElementById('waitlist-form');
    const emailInput = document.getElementById('email-input');
    const formMessage = document.getElementById('form-message');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            if (!email) return;

            const btn = form.querySelector('button');
            btn.disabled = true;
            btn.textContent = 'Invio...';
            formMessage.style.display = 'none';

            if (!supabase) {
                formMessage.textContent = 'Errore di connessione (Supabase non caricato).';
                formMessage.style.color = '#FF1744';
                formMessage.style.display = 'block';
                btn.disabled = false;
                btn.textContent = 'Join the Waitlist';
                return;
            }

            try {
                const { error } = await supabase
                    .from('waitlist_users')
                    .insert([{ email }]);

                if (error) throw error;

                formMessage.textContent = 'L\'iscrizione alla corsa è confermata!';
                formMessage.style.color = '#00E87A';
                formMessage.style.display = 'block';
                emailInput.value = '';
                
                // Incrementa a vista per effetto immediato
                if (countSpan.textContent !== '...') {
                    countSpan.textContent = parseInt(countSpan.textContent) + 1;
                } else {
                    updateCounter();
                }
            } catch (error) {
                console.error('Errore inserimento:', error);
                // Mostra messaggio coerente se mail è un duplicato
                formMessage.textContent = 'Ops, errore. Forse ti sei già iscritto?';
                formMessage.style.color = '#FF1744';
                formMessage.style.display = 'block';
            } finally {
                btn.disabled = false;
                btn.textContent = 'Join the Waitlist';
            }
        });
    }
});
