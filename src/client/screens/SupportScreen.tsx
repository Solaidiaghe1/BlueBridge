import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../shared/theme';
import { Header } from '../../shared/components/Header';
import { Card } from '../../shared/components/Card';

export const SupportScreen: React.FC = () => {
  const handleCall = () => {
    Linking.openURL('tel:5551234567');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@bluebridge.com');
  };

  const handleChat = () => {
    // This would open a chat modal in production
    console.log('Open chat');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Header title="Support" subtitle="We're here to help" />

        <View style={styles.content}>
          {/* Call Us */}
          <TouchableOpacity onPress={handleCall} activeOpacity={0.7}>
            <Card style={styles.supportCard}>
              <View style={styles.iconCircle}>
                <Text style={styles.icon}>📞</Text>
              </View>
              <Text style={styles.cardTitle}>Call Us</Text>
              <Text style={styles.cardSubtitle}>Mon-Fri 8am-8pm EST</Text>
              <Text style={styles.cardLink}>(555) 123-4567</Text>
            </Card>
          </TouchableOpacity>

          {/* Email Us */}
          <TouchableOpacity onPress={handleEmail} activeOpacity={0.7}>
            <Card style={styles.supportCard}>
              <View style={styles.iconCircle}>
                <Text style={styles.icon}>📧</Text>
              </View>
              <Text style={styles.cardTitle}>Email Us</Text>
              <Text style={styles.cardSubtitle}>Response within 24 hours</Text>
              <Text style={styles.cardLink}>support@bluebridge.com</Text>
            </Card>
          </TouchableOpacity>

          {/* Live Chat */}
          <TouchableOpacity onPress={handleChat} activeOpacity={0.7}>
            <Card style={styles.supportCard}>
              <View style={styles.iconCircle}>
                <Text style={styles.icon}>💬</Text>
              </View>
              <Text style={styles.cardTitle}>Live Chat</Text>
              <Text style={styles.cardSubtitle}>Average wait: 3 min</Text>
              <Text style={styles.cardLink}>Start Chat</Text>
            </Card>
          </TouchableOpacity>

          {/* FAQ Section */}
          <View style={styles.faqSection}>
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

            <Card style={styles.faqCard}>
              <TouchableOpacity style={styles.faqItem}>
                <Text style={styles.faqQuestion}>How does the inspection fee work?</Text>
                <Text style={styles.faqIcon}>›</Text>
              </TouchableOpacity>
            </Card>

            <Card style={styles.faqCard}>
              <TouchableOpacity style={styles.faqItem}>
                <Text style={styles.faqQuestion}>
                  What happens after the inspection?
                </Text>
                <Text style={styles.faqIcon}>›</Text>
              </TouchableOpacity>
            </Card>

            <Card style={styles.faqCard}>
              <TouchableOpacity style={styles.faqItem}>
                <Text style={styles.faqQuestion}>How are workers verified?</Text>
                <Text style={styles.faqIcon}>›</Text>
              </TouchableOpacity>
            </Card>

            <Card style={styles.faqCard}>
              <TouchableOpacity style={styles.faqItem}>
                <Text style={styles.faqQuestion}>Can I cancel a request?</Text>
                <Text style={styles.faqIcon}>›</Text>
              </TouchableOpacity>
            </Card>

            <Card style={styles.faqCard}>
              <TouchableOpacity style={styles.faqItem}>
                <Text style={styles.faqQuestion}>What areas do you serve?</Text>
                <Text style={styles.faqIcon}>›</Text>
              </TouchableOpacity>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  supportCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 40,
  },
  cardTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  cardSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  cardLink: {
    fontSize: typography.fontSize.lg,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  faqSection: {
    marginTop: spacing.xl,
  },
  faqTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  faqCard: {
    marginBottom: spacing.md,
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  faqQuestion: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  faqIcon: {
    fontSize: typography.fontSize.xl,
    color: colors.textSecondary,
    marginLeft: spacing.md,
  },
});
