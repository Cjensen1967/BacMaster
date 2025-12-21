import React from 'react';
import { X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  tab: 'rules' | 'instructions';
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, tab }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900/50 sticky top-0 backdrop-blur-md">
          <h2 className="text-xl font-bold text-white">
            {tab === 'rules' ? 'Baccarat Drawing Rules' : 'How To Use'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 text-gray-200">
          {tab === 'rules' ? (
            <div className="space-y-6">
              <section>
                <h3 className="text-amber-400 font-bold mb-2">1. Naturals</h3>
                <p>If Player or Banker has an initial total of 8 or 9, both stand. No more cards are dealt.</p>
              </section>

              <section>
                <h3 className="text-blue-400 font-bold mb-2">2. Player Rules</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>0 - 5: Player Draws</li>
                  <li>6 - 7: Player Stands</li>
                </ul>
              </section>

              <section>
                <h3 className="text-red-400 font-bold mb-2">3. Banker Rules</h3>
                <p className="mb-2 text-sm italic">If Player Stood (did not draw): Banker draws on 0-5, Stands on 6-7.</p>
                <p className="mb-2 text-sm italic">If Player Drew a 3rd Card, Banker acts according to this table:</p>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-gray-600">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="p-2 border border-gray-600">Banker Score</th>
                        <th className="p-2 border border-gray-600">Draws when Player's 3rd Card is:</th>
                        <th className="p-2 border border-gray-600">Stands when Player's 3rd Card is:</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border border-gray-600 font-bold text-center">0 - 2</td>
                        <td className="p-2 border border-gray-600 text-center text-green-400">Always Draw</td>
                        <td className="p-2 border border-gray-600 text-center">-</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-gray-600 font-bold text-center">3</td>
                        <td className="p-2 border border-gray-600 text-center">0, 1, 2, 3, 4, 5, 6, 7, 9</td>
                        <td className="p-2 border border-gray-600 text-center text-red-400">8</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-gray-600 font-bold text-center">4</td>
                        <td className="p-2 border border-gray-600 text-center">2, 3, 4, 5, 6, 7</td>
                        <td className="p-2 border border-gray-600 text-center text-red-400">0, 1, 8, 9</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-gray-600 font-bold text-center">5</td>
                        <td className="p-2 border border-gray-600 text-center">4, 5, 6, 7</td>
                        <td className="p-2 border border-gray-600 text-center text-red-400">0-3, 8-9</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-gray-600 font-bold text-center">6</td>
                        <td className="p-2 border border-gray-600 text-center">6, 7</td>
                        <td className="p-2 border border-gray-600 text-center text-red-400">0-5, 8-9</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-gray-600 font-bold text-center">7</td>
                        <td className="p-2 border border-gray-600 text-center">-</td>
                        <td className="p-2 border border-gray-600 text-center text-red-400">Always Stand</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-4">
              <p>This application simulates real Baccarat hands to train your decision-making accuracy.</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Cards are dealt automatically (initial 4).</li>
                <li>Analyze the board for a <strong>Natural Win</strong> (8 or 9).</li>
                <li>If no natural, decide if the <strong>Player</strong> should draw a 3rd card based on their total.</li>
                <li>If applicable, decide if the <strong>Banker</strong> should draw a 3rd card based on specific Baccarat rules.</li>
                <li>Finally, determine the <strong>Winner</strong> based on the final totals.</li>
              </ol>
              <p className="mt-4 p-3 bg-blue-900/40 rounded border border-blue-800">
                <strong>Tip:</strong> Use the "Peek" feature if you get stuck, but try to rely on memory!
              </p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white text-gray-900 font-bold rounded hover:bg-gray-200 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;