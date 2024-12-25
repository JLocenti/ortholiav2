import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { useFields } from '../hooks/useFields';
import { Question } from '../types/patient';
import CategoryItem from './CategoryItem';
import Modal from './Modal';
import QuestionEditor from './QuestionEditor';
import { FileText, Stethoscope, Activity, Bone, CircleDot } from 'lucide-react';

export default function PatientEditView() {
  const { categoryId } = useParams();
  const { categories } = useCategories();
  const { fields } = useFields(categoryId || '');

  const [questions, setQuestions] = useState<Question[]>(fields);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null);

  const getIconForCategory = (categoryId: string) => {
    switch (categoryId) {
      case 'general':
        return <FileText className="h-5 w-5" />;
      case 'medical':
        return <Stethoscope className="h-5 w-5" />;
      case 'vital':
        return <Activity className="h-5 w-5" />;
      case 'physical':
        return <Bone className="h-5 w-5" />;
      default:
        return <CircleDot className="h-5 w-5" />;
    }
  };

  const currentCategory = categories.find(c => c.id === categoryId);

  if (!currentCategory) {
    return <div>Catégorie non trouvée</div>;
  }

  const handleSaveQuestion = (questionData: Partial<Question>, shouldClose: boolean = true) => {
    if (!questionData.category) return;

    if (editingQuestion) {
      setQuestions(prev => prev.map(q =>
        q.id === editingQuestion.id ? { ...q, ...questionData } : q
      ));
    } else {
      const existingQuestions = questions.filter(q => q.category === questionData.category);
      const maxOrder = existingQuestions.length > 0
        ? Math.max(...existingQuestions.map(q => q.order))
        : -1;

      const newQuestion: Question = {
        id: `question_${Date.now()}`,
        text: questionData.text || '',
        type: questionData.type || 'text',
        category: questionData.category,
        description: questionData.description || '',
        required: questionData.required || false,
        order: maxOrder + 1,
        choices: questionData.choices || []
      };
      setQuestions(prev => [...prev, newQuestion]);
    }

    if (shouldClose) {
      setEditingQuestion(null);
      setAddingToCategory(null);
    }
  };

  const handleDeleteQuestion = (question: Question) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      setQuestions(prev => prev.filter(q => q.id !== question.id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Édition Patient
      </h1>

      <div className="space-y-6">
        {categories.map(category => (
          <CategoryItem
            key={category.id}
            category={category}
            questions={questions.filter(q => q.category === category.id)}
            onEditQuestion={setEditingQuestion}
            onAddQuestion={() => setAddingToCategory(category.id)}
            onDeleteQuestion={handleDeleteQuestion}
          />
        ))}
      </div>

      <Modal
        isOpen={!!editingQuestion || !!addingToCategory}
        onClose={() => {
          setEditingQuestion(null);
          setAddingToCategory(null);
        }}
        title={editingQuestion ? "Modifier le champ" : "Nouveau champ"}
      >
        <QuestionEditor
          question={editingQuestion || { category: addingToCategory }}
          onSave={handleSaveQuestion}
          onCancel={() => {
            setEditingQuestion(null);
            setAddingToCategory(null);
          }}
        />
      </Modal>
    </div>
  );
}