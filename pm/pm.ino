#include <LiquidCrystal_I2C.h>
#include <dht11.h>
#include <Wire.h>

const int buttonPins[] = {2, 3};
const int sensorPins[] = {12};
const int buzzerPin = 8;

unsigned long previousMillis = 0;
const long interval = 1000;  
int seconds = 0;        

#define BUTTON1 buttonPins[0]
#define BUTTON2 buttonPins[1]
#define BUTTON3 buttonPins[2]
#define SENSOR1 sensorPins[0]

volatile double temperature = 0.0;
volatile double humidity = 0.0;

volatile int secondsBetweenSends = 5;
volatile int timer = secondsBetweenSends;

dht11 DHT11;
LiquidCrystal_I2C lcd(0x27, 16, 2);

void readTempHumi() {
  int chk = DHT11.read(SENSOR1);
  temperature = (float)DHT11.temperature;
  humidity = (float)DHT11.humidity;
}

void button1Interrupt() {
  tone(buzzerPin, 500, 50);
  if(secondsBetweenSends > 10)
    secondsBetweenSends -= 10;
}

void button2Interrupt() {
  tone(buzzerPin, 1500, 50);
  if(secondsBetweenSends < 300)
    secondsBetweenSends += 10;
}


void sendData(double temp, double humi) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Data Sent");
  Serial.println("Begin");
  Serial.println(temp);
  if(temp > 50 && temp < 75)
    Serial.println("Good");
  else
    Serial.println("Bad");
  Serial.println(humi);
  if(humi > 60 && humi < 95)
    Serial.println("Good");
  else
    Serial.println("Bad");
    
  Serial.println("End");
  delay(2000);
  // Create the protocol for Serial Send so data doesn't get lost
}

void printToLCD() {
  if(timer == 0) {
    sendData(temperature, humidity);
  } else {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Sending in: ");
    lcd.print(timer);
    lcd.print(" s");
  }
  lcd.setCursor(0, 1);
  lcd.print("Interval: ");
  lcd.print(secondsBetweenSends);
  lcd.print(" s");
}

void timerRundown() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    printToLCD();
    readTempHumi();
    previousMillis = currentMillis;
    timer--;
  }
  
  if(timer == -1) {
    timer = secondsBetweenSends;
    return;
  }
}

void setup() {
  Serial.begin(9600);
  lcd.init();
  lcd.backlight();
  for(int i = 0; i < 2; i++) {
    pinMode(buttonPins[i], INPUT);
  }
  // Sensor1 doesn't need to have the pin mode
  pinMode(sensorPins[0], INPUT);

  pinMode(buzzerPin, OUTPUT);

  attachInterrupt(digitalPinToInterrupt(BUTTON1), button1Interrupt, FALLING);
  attachInterrupt(digitalPinToInterrupt(BUTTON2), button2Interrupt, FALLING);
  
}

void loop() {
  timerRundown();
}
