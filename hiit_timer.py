import time
import os
import sys
from datetime import datetime

class HIITTimer:
    def __init__(self):
        self.preparation_time = 10  # 10 secondes de préparation
        self.high_intensity_time = 60  # 1 minute de marche intensive
        self.low_intensity_time = 90  # 1.5 minutes de récupération
        self.running = False
        
    def clear_screen(self):
        os.system('cls' if os.name == 'nt' else 'clear')
        
    def format_time(self, seconds):
        return f"{seconds // 60:02d}:{seconds % 60:02d}"
    
    def display_countdown(self, phase, remaining_time):
        self.clear_screen()
        print("\n" * 2)
        print("=== HIIT Walk Timer ===".center(50))
        print("\n")
        print(f"Phase actuelle: {phase}".center(50))
        print("\n")
        print(self.format_time(remaining_time).center(50))
        print("\n")
        print("Appuyez sur Ctrl+C pour arrêter".center(50))
        print("\n" * 2)
        
    def run(self):
        try:
            self.running = True
            
            # Phase de préparation
            print("\nPréparation - Préparez-vous à commencer!")
            for i in range(self.preparation_time, 0, -1):
                self.display_countdown("Préparation", i)
                time.sleep(1)
            
            # Boucle principale
            while self.running:
                # Phase intensive
                print("\nMARCHE INTENSIVE!")
                for i in range(self.high_intensity_time, 0, -1):
                    self.display_countdown("MARCHE INTENSIVE!", i)
                    time.sleep(1)
                
                if not self.running:
                    break
                    
                # Phase de récupération
                print("\nRécupération - Marche modérée")
                for i in range(self.low_intensity_time, 0, -1):
                    self.display_countdown("Récupération", i)
                    time.sleep(1)
                    
        except KeyboardInterrupt:
            self.running = False
            self.clear_screen()
            print("\nEntraînement terminé!")
            print(f"Session terminée à: {datetime.now().strftime('%H:%M:%S')}")

if __name__ == "__main__":
    timer = HIITTimer()
    timer.run()
