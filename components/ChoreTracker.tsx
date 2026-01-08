'use client';

import React, { useState, useEffect } from 'react';
import { Check, Star, Sparkles, Trophy, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Chore {
  id: number;
  name: string;
  points: number;
  completed: boolean;
  emoji: string;
  color: string;
}

export default function ChoreTracker() {
  const [chores, setChores] = useState<Chore[]>([
    { id: 1, name: '🦷 Brush Teeth (Morning)', points: 1, completed: false, emoji: '🌅', color: 'from-rose-200 to-pink-200' },
    { id: 2, name: '🦷 Brush Teeth (Night)', points: 1, completed: false, emoji: '🌙', color: 'from-purple-200 to-violet-200' },
    { id: 3, name: '🧹 Clean Up', points: 2, completed: false, emoji: '✨', color: 'from-amber-200 to-yellow-200' },
    { id: 4, name: '🎒 Unpack Backpack', points: 1, completed: false, emoji: '🏠', color: 'from-emerald-200 to-teal-200' },
    { id: 5, name: '🧸 Put Toys Away', points: 2, completed: false, emoji: '📦', color: 'from-sky-200 to-blue-200' },
    { id: 6, name: '🦷 Floss', points: 1, completed: false, emoji: '🪥', color: 'from-fuchsia-200 to-pink-200' }
  ]);

  const [lastResetDate, setLastResetDate] = useState<string>('');
  const [allTimeScore, setAllTimeScore] = useState<number>(0);
  const [todayScore, setTodayScore] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const [justLoaded, setJustLoaded] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const playSound = (frequency: number, duration: number) => {
    if (typeof window === 'undefined') return;
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      // Silently fail
    }
  };

  const playCheckSound = () => {
    playSound(800, 0.1);
    setTimeout(() => playSound(1000, 0.15), 50);
  };

  const playUncheckSound = () => {
    playSound(600, 0.1);
    setTimeout(() => playSound(500, 0.1), 50);
  };

  const playCelebrationSound = () => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playSound(freq, 0.3), i * 150);
    });
  };

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      setMounted(true);
      
      try {
        const { data, error } = await supabase
          .from('chores')
          .select('*')
          .eq('id', 1)
          .single();

        if (error) throw error;

        if (data) {
          setChores(data.chore_data);
          setLastResetDate(data.last_reset_date);
          setAllTimeScore(data.all_time_score);
          setTodayScore(data.today_score);
          setJustLoaded(true); // Mark that we just loaded
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Check for daily reset
  useEffect(() => {
    if (!mounted) return;

    const resetIfNeeded = async () => {
      const today = new Date().toISOString().split('T')[0];
      if (today !== lastResetDate) {
        const newAllTimeScore = allTimeScore + todayScore;
        const resetChores = chores.map(chore => ({ ...chore, completed: false }));

        try {
          await supabase
            .from('chores')
            .update({
              chore_data: resetChores,
              last_reset_date: today,
              all_time_score: newAllTimeScore,
              today_score: 0
            })
            .eq('id', 1);

          setAllTimeScore(newAllTimeScore);
          setChores(resetChores);
          setTodayScore(0);
          setLastResetDate(today);
          setShowCelebration(false);
        } catch (error) {
          console.error('Error resetting chores:', error);
        }
      }
    };

    resetIfNeeded();
  }, [mounted, lastResetDate, chores, allTimeScore, todayScore]);

  // Save chores to Supabase whenever they change (but not on initial load)
  useEffect(() => {
    if (!mounted || justLoaded) {
      if (justLoaded) setJustLoaded(false);
      return;
    }

    const saveData = async () => {
      const currentTodayScore = chores.filter(c => c.completed).reduce((sum, c) => sum + c.points, 0);
      setTodayScore(currentTodayScore);

      try {
        await supabase
          .from('chores')
          .update({
            chore_data: chores,
            today_score: currentTodayScore
          })
          .eq('id', 1);
      } catch (error) {
        console.error('Error saving chores:', error);
      }
    };

    saveData();
  }, [chores, mounted, justLoaded]);

  const toggleChore = (id: number) => {
    const chore = chores.find(c => c.id === id);
    if (!chore) return;
    
    const willBeCompleted = !chore.completed;
    
    setChores(chores.map(c => 
      c.id === id ? { ...c, completed: !c.completed } : c
    ));

    if (willBeCompleted) {
      playCheckSound();
    } else {
      playUncheckSound();
    }

    const newChores = chores.map(c => c.id === id ? { ...c, completed: !c.completed } : c);
    const allComplete = newChores.every(c => c.completed);
    
    if (allComplete && willBeCompleted) {
      setShowCelebration(true);
      playCelebrationSound();
    } else if (showCelebration && !allComplete) {
      setShowCelebration(false);
    }
  };

  const totalPoints = chores.filter(c => c.completed).reduce((sum, c) => sum + c.points, 0);
  const maxPoints = chores.reduce((sum, c) => sum + c.points, 0);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen relative p-4 sm:p-8 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 animate-gradient">
        <style jsx>{`
          @keyframes gradient {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 15s ease infinite;
          }
        `}</style>
      </div>
      {/* Celebration Modal */}
      {totalPoints === maxPoints && showCelebration && (
        <div 
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={() => setShowCelebration(false)}
        >
          <div 
            className="bg-gradient-to-br from-pink-200 to-purple-200 rounded-3xl shadow-2xl p-8 sm:p-10 text-center border-4 border-white max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-5xl sm:text-6xl font-black text-purple-700 mb-4">
              🎉 AMAZING! 🎉
            </p>
            <p className="text-3xl font-bold text-purple-600 mb-4">
              All chores done!
            </p>
            <div className="text-6xl mb-6">
              ⭐✨💫
            </div>
            <button
              onClick={() => setShowCelebration(false)}
              className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-black text-xl hover:bg-purple-50 active:scale-95 transition-all shadow-lg"
            >
              YAY! 🎈
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto relative">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-6 sm:p-8 mb-6 text-center border-2 border-purple-200">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              My Chores!
            </h1>
            <Sparkles className="w-10 h-10 text-pink-400" />
          </div>
          
          <div className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl p-6 mt-4 border-2 border-amber-200 shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
              <span className="text-6xl font-black text-amber-600">{totalPoints}</span>
              <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-xl font-bold text-amber-700">
              out of {maxPoints} stars today!
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 mt-4 border-2 border-purple-200 shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-8 h-8 text-purple-500 fill-purple-500" />
              <span className="text-5xl font-black text-purple-600">{allTimeScore + todayScore}</span>
              <TrendingUp className="w-8 h-8 text-pink-500" />
            </div>
            <p className="text-xl font-bold text-purple-600">
              Total Stars Ever!
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {chores.map((chore) => (
            <button
              key={chore.id}
              onClick={() => toggleChore(chore.id)}
              className={`w-full p-5 rounded-2xl shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98] border-2 ${
                chore.completed
                  ? 'bg-gradient-to-br from-emerald-200 to-teal-200 border-emerald-300 shadow-lg'
                  : `bg-gradient-to-br ${chore.color} hover:shadow-lg border-white/50`
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center border-3 transition-all shadow-sm ${
                    chore.completed
                      ? 'bg-white border-emerald-400'
                      : 'bg-white/90 border-gray-300'
                  }`}>
                    {chore.completed ? (
                      <Check className="w-8 h-8 text-emerald-500 stroke-[3]" />
                    ) : (
                      <span className="text-3xl">{chore.emoji}</span>
                    )}
                  </div>
                  
                  <div className="text-left">
                    <p className={`text-xl sm:text-2xl font-bold ${
                      chore.completed ? 'text-emerald-800' : 'text-gray-700'
                    }`}>
                      {chore.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/80 shadow-sm border border-gray-200">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-lg font-black text-gray-700">
                    {chore.points}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}